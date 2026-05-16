import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isObjectIdOrHexString } from 'mongoose';
import { Shop, ShopDocument } from '@api/shop/schema/shop.schema';
import { ShopKind } from '@api/shop/enum/shop-kind.enum';
import { SupplierRepository } from './supplier.repository';
import { SupplierCodeService } from './supplier-code.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierShopDto } from './dto/update-supplier-shop.dto';
import { PaginatedSupplierQueryDto } from './dto/paginated-supplier-query.dto';
import { UserDocument } from '@api/user/schema/user.schema';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Shop.name)
    private readonly shopModel: Model<ShopDocument>,
    private readonly repository: SupplierRepository,
    private readonly codeService: SupplierCodeService,
  ) {}

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async getPaginatedSuppliers(
    shopId: string,
    query: PaginatedSupplierQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    this.assertObjectId(shopId);
    return this.repository.getPaginatedSuppliers(shopId, query);
  }

  async getShopSupplierStats(shopId: string) {
    this.assertObjectId(shopId);
    return this.repository.getShopSupplierStats(shopId);
  }

  async peekNextSupplierCode(shopId: string): Promise<string> {
    return this.codeService.peek(shopId);
  }

  async getSupplierById(shopId: string, supplierId: string): Promise<any> {
    this.assertObjectId(shopId);
    this.assertObjectId(supplierId);
    const buying = await this.shopModel
      .findOne(
        { _id: shopId, 'suppliers._id': new Types.ObjectId(supplierId) },
        { 'suppliers.$': 1 },
      )
      .lean()
      .exec();
    const link = buying?.suppliers?.[0];
    if (!link) throw new NotFoundException('Supplier not found');
    const shop = await this.shopModel
      .findById(link.supplierShop)
      .lean()
      .exec();
    return { ...link, shop };
  }

  async lookupShops(
    shopId: string,
    opts: {
      q?: string;
      state?: string;
      city?: string;
      kind?: string;
      gstStatus?: 'any' | 'registered' | 'unregistered';
      sort?: 'popular' | 'name' | 'recent' | 'nearest';
      cursor?: string;
      limit?: number;
    },
  ) {
    this.assertObjectId(shopId);
    return this.repository.lookupShops(shopId, opts);
  }

  async getSuggestions(shopId: string) {
    this.assertObjectId(shopId);
    return this.repository.getSuggestions(shopId);
  }

  async getShopPreview(shopId: string, targetShopId: string) {
    this.assertObjectId(shopId);
    this.assertObjectId(targetShopId);
    const preview = await this.repository.getShopPreview(shopId, targetShopId);
    if (!preview) throw new NotFoundException('Shop not found');
    return preview;
  }

  // ---------------------------------------------------------------------------
  // Create / link
  // ---------------------------------------------------------------------------

  /**
   * Adds a supplier link to the buying shop. Body must include exactly one of:
   *   - `supplierShopId` → link an existing Shop doc as supplier
   *   - `newShop`        → create a fresh EXTERNAL_SUPPLIER Shop and link it
   */
  async createSupplier(
    shopId: string,
    dto: CreateSupplierDto,
    user?: UserDocument,
  ): Promise<any> {
    this.assertObjectId(shopId);
    if (!dto.supplierShopId === !dto.newShop) {
      throw new BadRequestException(
        'Provide exactly one of `supplierShopId` or `newShop`.',
      );
    }

    let supplierShopId: Types.ObjectId;

    if (dto.supplierShopId) {
      this.assertObjectId(dto.supplierShopId);
      if (dto.supplierShopId === shopId) {
        throw new BadRequestException(
          'A shop cannot be added as its own supplier.',
        );
      }
      const exists = await this.shopModel.exists({ _id: dto.supplierShopId });
      if (!exists) throw new NotFoundException('Supplier shop not found.');
      supplierShopId = new Types.ObjectId(dto.supplierShopId);
    } else {
      const created = await this.shopModel.create({
        ...dto.newShop,
        kind: ShopKind.EXTERNAL_SUPPLIER,
      });
      supplierShopId = created._id as Types.ObjectId;
    }

    // Refuse to add the same supplier twice (active links only).
    const already = await this.shopModel
      .findOne({
        _id: shopId,
        suppliers: {
          $elemMatch: {
            supplierShop: supplierShopId,
            isDeleted: { $ne: true },
          },
        },
      })
      .lean()
      .exec();
    if (already) {
      throw new ConflictException(
        'This shop is already linked as a supplier.',
      );
    }

    const supplierCode =
      dto.supplierCode || (await this.codeService.generate(shopId));

    const linkSubdoc = {
      _id: new Types.ObjectId(),
      supplierShop: supplierShopId,
      supplierCode,
      alias: dto.alias,
      status: dto.status,
      paymentTerms: dto.paymentTerms,
      creditLimit: dto.creditLimit ?? 0,
      creditPeriodDays: dto.creditPeriodDays ?? 0,
      openingBalance: dto.openingBalance ?? 0,
      defaultDiscountPct: dto.defaultDiscountPct ?? 0,
      tags: dto.tags ?? [],
      notes: dto.notes,
      primaryContact: dto.primaryContact,
      addedBy: user?._id,
      updatedBy: user?._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.shopModel
      .updateOne(
        { _id: shopId },
        { $push: { suppliers: linkSubdoc } },
      )
      .exec();

    return this.getSupplierById(shopId, linkSubdoc._id.toString());
  }

  // ---------------------------------------------------------------------------
  // Update link metadata
  // ---------------------------------------------------------------------------

  async updateSupplier(
    shopId: string,
    supplierId: string,
    dto: UpdateSupplierDto,
    user?: UserDocument,
  ): Promise<any> {
    this.assertObjectId(shopId);
    this.assertObjectId(supplierId);
    const set: Record<string, unknown> = {
      'suppliers.$.updatedBy': user?._id,
      'suppliers.$.updatedAt': new Date(),
    };
    for (const [k, v] of Object.entries(dto)) {
      if (v === undefined) continue;
      set[`suppliers.$.${k}`] = v;
    }
    const result = await this.shopModel
      .updateOne(
        { _id: shopId, 'suppliers._id': new Types.ObjectId(supplierId) },
        { $set: set },
      )
      .exec();
    if (result.matchedCount === 0)
      throw new NotFoundException('Supplier not found');
    return this.getSupplierById(shopId, supplierId);
  }

  // ---------------------------------------------------------------------------
  // Update supplier shop fields (only for EXTERNAL_SUPPLIER)
  // ---------------------------------------------------------------------------

  async updateSupplierShop(
    shopId: string,
    supplierId: string,
    dto: UpdateSupplierShopDto,
  ): Promise<any> {
    this.assertObjectId(shopId);
    this.assertObjectId(supplierId);
    const supplier = await this.getSupplierById(shopId, supplierId);
    if (supplier.shop?.kind !== ShopKind.EXTERNAL_SUPPLIER) {
      throw new ForbiddenException(
        'Only EXTERNAL_SUPPLIER shops can be edited from a buyer.',
      );
    }
    await this.shopModel
      .updateOne({ _id: supplier.shop._id }, { $set: dto })
      .exec();
    return this.getSupplierById(shopId, supplierId);
  }

  // ---------------------------------------------------------------------------
  // Delete / unlink
  // ---------------------------------------------------------------------------

  async deleteSupplier(
    shopId: string,
    supplierId: string,
    user?: UserDocument,
  ): Promise<void> {
    this.assertObjectId(shopId);
    this.assertObjectId(supplierId);
    const supplier = await this.getSupplierById(shopId, supplierId);

    const totalOrders = supplier.stats?.totalOrders ?? 0;
    const outstandingPayable = supplier.stats?.outstandingPayable ?? 0;
    const canHardUnlink = totalOrders === 0 && outstandingPayable === 0;

    if (canHardUnlink) {
      await this.shopModel
        .updateOne(
          { _id: shopId },
          { $pull: { suppliers: { _id: new Types.ObjectId(supplierId) } } },
        )
        .exec();

      // If this was an EXTERNAL_SUPPLIER and no other shop references it,
      // hard-delete the supplier shop too.
      if (supplier.shop?.kind === ShopKind.EXTERNAL_SUPPLIER) {
        const referenced = await this.shopModel.exists({
          'suppliers.supplierShop': supplier.shop._id,
        });
        if (!referenced) {
          await this.shopModel.deleteOne({ _id: supplier.shop._id }).exec();
        }
      }
      return;
    }

    // Soft delete the link, preserve history.
    await this.shopModel
      .updateOne(
        { _id: shopId, 'suppliers._id': new Types.ObjectId(supplierId) },
        {
          $set: {
            'suppliers.$.isDeleted': true,
            'suppliers.$.deletedAt': new Date(),
            'suppliers.$.deletedBy': user?._id,
          },
        },
      )
      .exec();
  }

  // ---------------------------------------------------------------------------
  // Stats hook — wired in advance; called from the future PO/GRN module.
  // ---------------------------------------------------------------------------

  async onPurchaseRecorded(
    buyingShopId: string,
    supplierShopId: string,
    amountBilled: number,
    amountPaid: number,
    purchaseDate: Date,
  ): Promise<void> {
    if (!isObjectIdOrHexString(buyingShopId)) return;
    if (!isObjectIdOrHexString(supplierShopId)) return;

    const buying = await this.shopModel
      .findOne(
        {
          _id: buyingShopId,
          'suppliers.supplierShop': new Types.ObjectId(supplierShopId),
        },
        { 'suppliers.$': 1 },
      )
      .lean()
      .exec();
    const link = buying?.suppliers?.[0];
    if (!link) return;

    const stats: any = link.stats || {};
    const totalOrders = (stats.totalOrders ?? 0) + 1;
    const totalPurchased = (stats.totalPurchased ?? 0) + amountBilled;
    const totalPaid = (stats.totalPaid ?? 0) + amountPaid;
    const outstandingPayable =
      (link.openingBalance ?? 0) + totalPurchased - totalPaid;
    const firstPurchaseAt = stats.firstPurchaseAt ?? purchaseDate;
    const avgOrderValue = totalPurchased / totalOrders;

    await this.shopModel
      .updateOne(
        {
          _id: buyingShopId,
          'suppliers._id': link._id,
        },
        {
          $set: {
            'suppliers.$.stats': {
              totalOrders,
              totalPurchased,
              totalPaid,
              outstandingPayable,
              firstPurchaseAt,
              lastPurchaseAt: purchaseDate,
              avgOrderValue,
            },
          },
        },
      )
      .exec();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private assertObjectId(id: string) {
    if (!isObjectIdOrHexString(id)) {
      throw new BadRequestException(`Invalid id: ${id}`);
    }
  }
}
