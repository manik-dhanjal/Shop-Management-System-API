import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shop, ShopDocument } from '@api/shop/schema/shop.schema';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginatedSupplierQueryDto } from './dto/paginated-supplier-query.dto';
import { SupplierStatus } from './enum/supplier-status.enum';
import { ShopKind } from '@api/shop/enum/shop-kind.enum';

export type PaginatedSupplierRow = {
  /** SupplierLink subdoc fields */
  _id: string;
  supplierShop: string;
  supplierCode?: string;
  alias?: string;
  status: SupplierStatus;
  paymentTerms: string;
  creditLimit: number;
  creditPeriodDays: number;
  openingBalance: number;
  defaultDiscountPct: number;
  tags: string[];
  notes?: string;
  primaryContact?: { name?: string; phone?: string; email?: string };
  stats: Record<string, unknown>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Populated supplier shop */
  shop: {
    _id: string;
    name: string;
    kind: ShopKind;
    location?: Record<string, unknown>;
    gstDetails?: Record<string, unknown>;
    phone?: string;
    email?: string;
    contactPersonName?: string;
    contactPersonDesignation?: string;
  };
};

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectModel(Shop.name)
    private readonly model: Model<ShopDocument>,
  ) {}

  /**
   * Aggregation against the buying shop's `suppliers[]` subdoc array.
   * Joins each row with its supplierShop document, applies search /
   * status / kind filters, returns a paginated facet.
   */
  async getPaginatedSuppliers(
    buyingShopId: string,
    query: PaginatedSupplierQueryDto,
  ): Promise<PaginatedResponseDto<PaginatedSupplierRow>> {
    const skip = (query.page - 1) * query.limit;
    const search = query.search?.trim();
    const filter = (query.filter ?? {}) as Record<string, unknown>;

    const linkFilter: Record<string, unknown> = {};
    if (!query.includeDeleted) {
      linkFilter['suppliers.isDeleted'] = { $ne: true };
    }
    if (filter.status) linkFilter['suppliers.status'] = filter.status;

    const shopFilter: Record<string, unknown> = {};
    if (filter.kind) shopFilter['shop.kind'] = filter.kind;

    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      shopFilter.$or = [
        { 'shop.name': re },
        { 'shop.gstDetails.gstin': re },
        { 'shop.gstDetails.legalName': re },
        { 'shop.phone': re },
        { 'suppliers.alias': re },
        { 'suppliers.supplierCode': re },
      ];
    }

    const pipeline: any[] = [
      { $match: { _id: new Types.ObjectId(buyingShopId) } },
      { $project: { suppliers: 1 } },
      { $unwind: '$suppliers' },
      { $match: linkFilter },
      {
        $lookup: {
          from: 'shops',
          localField: 'suppliers.supplierShop',
          foreignField: '_id',
          as: 'shop',
        },
      },
      { $unwind: '$shop' },
    ];

    if (Object.keys(shopFilter).length) {
      pipeline.push({ $match: shopFilter });
    }

    // Sort: latest-added first by default.
    pipeline.push({ $sort: { 'suppliers.createdAt': -1 } });

    pipeline.push({
      $facet: {
        docs: [
          { $skip: skip },
          { $limit: query.limit },
          {
            $replaceRoot: {
              newRoot: { $mergeObjects: ['$suppliers', { shop: '$shop' }] },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.model.aggregate(pipeline).exec();
    const docs = (result[0]?.docs ?? []) as PaginatedSupplierRow[];
    const totalRecords = result[0]?.totalCount?.[0]?.count ?? 0;
    const totalPages =
      query.limit > 0 ? Math.ceil(totalRecords / query.limit) : 0;
    const currentPage =
      query.limit > 0 ? Math.floor(skip / query.limit) + 1 : 1;

    return {
      docs,
      pagination: {
        totalRecords,
        currentPage,
        totalPages,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
      },
    };
  }

  /**
   * Shop-wide rollup powering the KPI cards. One aggregation pass.
   */
  async getShopSupplierStats(buyingShopId: string): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    withGstin: number;
    totalPayable: number;
  }> {
    const result = await this.model
      .aggregate<{
        totalSuppliers: number;
        activeSuppliers: number;
        withGstin: number;
        totalPayable: number;
      }>([
        { $match: { _id: new Types.ObjectId(buyingShopId) } },
        { $project: { suppliers: 1 } },
        { $unwind: '$suppliers' },
        { $match: { 'suppliers.isDeleted': { $ne: true } } },
        {
          $lookup: {
            from: 'shops',
            localField: 'suppliers.supplierShop',
            foreignField: '_id',
            as: 'shop',
          },
        },
        { $unwind: '$shop' },
        {
          $group: {
            _id: null,
            totalSuppliers: { $sum: 1 },
            activeSuppliers: {
              $sum: {
                $cond: [{ $eq: ['$suppliers.status', SupplierStatus.ACTIVE] }, 1, 0],
              },
            },
            withGstin: {
              $sum: {
                $cond: [
                  { $eq: [{ $type: '$shop.gstDetails.gstin' }, 'string'] },
                  1,
                  0,
                ],
              },
            },
            totalPayable: {
              $sum: { $ifNull: ['$suppliers.stats.outstandingPayable', 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalSuppliers: 1,
            activeSuppliers: 1,
            withGstin: 1,
            totalPayable: 1,
          },
        },
      ])
      .exec();

    return (
      result[0] ?? {
        totalSuppliers: 0,
        activeSuppliers: 0,
        withGstin: 0,
        totalPayable: 0,
      }
    );
  }

  /**
   * Search Shop docs for the find-supplier picker.
   *
   * Powers all three modes the UI exercises:
   *   - free-text search (q on name / phone / GSTIN / legal name)
   *   - faceted filtering (state, city, kind, gstStatus)
   *   - sort (popular | name | recent | nearest)
   *
   * Returns docs joined with `linkedByCount` and `alreadyLinked` (so the
   * picker can render a "LINKED" chip without a second roundtrip).
   * Pagination is cursor-based — `nextCursor` is opaque to clients.
   */
  async lookupShops(
    buyingShopId: string,
    opts: {
      q?: string;
      state?: string;
      city?: string;
      kind?: string; // ShopKind value
      gstStatus?: 'any' | 'registered' | 'unregistered';
      sort?: 'popular' | 'name' | 'recent' | 'nearest';
      cursor?: string;
      limit?: number;
    },
  ): Promise<{
    docs: Array<Record<string, unknown> & { linkedByCount: number; alreadyLinked: boolean }>;
    nextCursor: string | null;
  }> {
    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
    const skip = decodeCursor(opts.cursor);

    const buyingId = new Types.ObjectId(buyingShopId);
    const buying = await this.model
      .findById(buyingId, { suppliers: 1, location: 1 })
      .lean()
      .exec();
    const alreadyIds = ((buying?.suppliers ?? []) as any[]).map(
      (s) => new Types.ObjectId(String(s.supplierShop)),
    );
    const buyerState = (buying as any)?.location?.state;

    const match: Record<string, unknown> = {
      _id: { $ne: buyingId },
      isDeleted: { $ne: true },
    };

    const q = opts.q?.trim();
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      match.$or = [
        { name: re },
        { phone: re },
        { 'gstDetails.gstin': re },
        { 'gstDetails.legalName': re },
      ];
    }
    if (opts.kind) match.kind = opts.kind;
    if (opts.state) match['location.state'] = opts.state;
    if (opts.city) match['location.city'] = opts.city;
    if (opts.gstStatus === 'registered') {
      // Field present + non-null (covers Mongoose-stored strings regardless of BSON type quirks).
      match['gstDetails.gstin'] = { $exists: true, $nin: [null, ''] };
    } else if (opts.gstStatus === 'unregistered') {
      // Either no gstDetails at all OR gstDetails.gstin is null / empty.
      match.$and = [
        ...(((match.$and as any[]) ?? [])),
        {
          $or: [
            { gstDetails: { $exists: false } },
            { 'gstDetails.gstin': { $in: [null, ''] } },
            { 'gstDetails.gstin': { $exists: false } },
          ],
        },
      ];
    }

    // Build sort. For "popular" / "nearest" we sort after the lookup so we
    // can use derived fields (linkedByCount / sameState).
    const sortKey: Record<string, 1 | -1> =
      opts.sort === 'name'
        ? { name: 1 }
        : opts.sort === 'recent'
          ? { createdAt: -1 }
          : opts.sort === 'nearest'
            ? { sameState: -1, name: 1 }
            : opts.sort === 'popular'
              ? { linkedByCount: -1, name: 1 }
              : { linkedByCount: -1, name: 1 }; // default popular

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'shops',
          let: { sid: '$_id' },
          pipeline: [
            { $match: { $expr: { $in: ['$$sid', { $ifNull: ['$suppliers.supplierShop', []] }] } } },
            { $count: 'n' },
          ],
          as: '_links',
        },
      },
      {
        $addFields: {
          linkedByCount: { $ifNull: [{ $arrayElemAt: ['$_links.n', 0] }, 0] },
          alreadyLinked: { $in: ['$_id', alreadyIds] },
          sameState: buyerState
            ? { $cond: [{ $eq: ['$location.state', buyerState] }, 1, 0] }
            : 0,
        },
      },
      { $sort: sortKey },
      { $skip: skip },
      { $limit: limit + 1 }, // +1 to detect hasMore
      { $project: { _links: 0 } },
    ];

    const docs = await this.model.aggregate(pipeline).exec();
    const hasMore = docs.length > limit;
    const slice = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore ? encodeCursor(skip + limit) : null;
    return { docs: slice as any, nextCursor };
  }

  /** Three rails for the empty-state suggestions section. */
  async getSuggestions(buyingShopId: string): Promise<{
    popularInYourState: any[];
    popularOverall: any[];
    recentlyAdded: any[];
  }> {
    const buyingId = new Types.ObjectId(buyingShopId);
    const buying = await this.model
      .findById(buyingId, { suppliers: 1, location: 1 })
      .lean()
      .exec();
    const alreadyIds = ((buying?.suppliers ?? []) as any[]).map(
      (s) => new Types.ObjectId(String(s.supplierShop)),
    );
    const buyerState = (buying as any)?.location?.state;
    const exclude = [buyingId, ...alreadyIds];

    const withCount = (extraMatch: Record<string, unknown>, sort: any, limit = 8) => [
      {
        $match: {
          _id: { $nin: exclude },
          isDeleted: { $ne: true },
          ...extraMatch,
        },
      },
      {
        $lookup: {
          from: 'shops',
          let: { sid: '$_id' },
          pipeline: [
            { $match: { $expr: { $in: ['$$sid', { $ifNull: ['$suppliers.supplierShop', []] }] } } },
            { $count: 'n' },
          ],
          as: '_links',
        },
      },
      {
        $addFields: {
          linkedByCount: { $ifNull: [{ $arrayElemAt: ['$_links.n', 0] }, 0] },
          alreadyLinked: false,
        },
      },
      { $sort: sort },
      { $limit: limit },
      { $project: { _links: 0 } },
    ];

    const [popularInYourState, popularOverall, recentlyAdded] = await Promise.all([
      buyerState
        ? this.model
            .aggregate(
              withCount({ 'location.state': buyerState }, { linkedByCount: -1, name: 1 }),
            )
            .exec()
        : Promise.resolve([]),
      this.model
        .aggregate(withCount({}, { linkedByCount: -1, name: 1 }))
        .exec(),
      this.model
        .aggregate(
          withCount({ kind: 'EXTERNAL_SUPPLIER' }, { createdAt: -1 }),
        )
        .exec(),
    ]);

    return { popularInYourState, popularOverall, recentlyAdded };
  }

  /** Single shop preview by id — used by the right-side panel. */
  async getShopPreview(
    buyingShopId: string,
    targetShopId: string,
  ): Promise<any | null> {
    const buying = await this.model
      .findById(buyingShopId, { suppliers: 1 })
      .lean()
      .exec();
    const alreadyLinked = ((buying?.suppliers ?? []) as any[]).some(
      (s) => String(s.supplierShop) === targetShopId,
    );

    const result = await this.model
      .aggregate([
        { $match: { _id: new Types.ObjectId(targetShopId) } },
        {
          $lookup: {
            from: 'shops',
            let: { sid: '$_id' },
            pipeline: [
              { $match: { $expr: { $in: ['$$sid', { $ifNull: ['$suppliers.supplierShop', []] }] } } },
              { $count: 'n' },
            ],
            as: '_links',
          },
        },
        {
          $addFields: {
            linkedByCount: {
              $ifNull: [{ $arrayElemAt: ['$_links.n', 0] }, 0],
            },
            alreadyLinked,
          },
        },
        { $project: { _links: 0, suppliers: 0 } },
      ])
      .exec();

    return result[0] ?? null;
  }
}

// ---- cursor helpers --------------------------------------------------------
// Opaque skip-based cursor. base64('{"skip":N}'). Cheap, stable for the
// sort keys we use, and easy to evolve to a real keyset cursor later.
function encodeCursor(skip: number): string {
  return Buffer.from(JSON.stringify({ skip })).toString('base64url');
}
function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    return Math.max(0, parseInt(parsed.skip, 10) || 0);
  } catch {
    return 0;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
