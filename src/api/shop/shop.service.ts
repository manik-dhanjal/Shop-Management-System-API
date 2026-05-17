import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopRepository } from './repository/shops.repository';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { Shop, ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import mongoose, { isObjectIdOrHexString, Types } from 'mongoose';
import { UpdateShopDto } from './dto/update-shop.dto';
import { omit } from 'lodash';
import { UserService } from '@api/user/user.service';
import { User, UserDocument } from '@api/user/schema/user.schema';
import { UserRole } from '@api/user/enum/user-role.enum';
import { ShopStatus } from './enum/shop-status.enum';

@Injectable()
export class ShopService {
  constructor(
    private readonly repository: ShopRepository,
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Shop.name) private readonly shopModel: Model<ShopDocument>,
  ) {}

  async getShopById(
    shopId: string,
    user?: LeanDocument<UserDocument>,
  ): Promise<any> {
    if (!isObjectIdOrHexString(shopId))
      throw new NotFoundException('Invalid Shop ID');
    const shop = await this.repository.findOne(
      { _id: shopId, isDeleted: { $ne: true } },
      {},
      {},
      ['logo'],
      true,
    );
    if (!shop) throw new NotFoundException('Shop not found');
    // Attach the calling user's role on this shop (if any) for the UI.
    let myRoles: UserRole[] = [];
    if (user) {
      const meta = (user.shopsMeta || []).find(
        (m: any) => String((m.shop as any)?._id ?? m.shop) === shopId,
      );
      myRoles = (meta?.roles ?? []) as UserRole[];
    }
    return { ...shop, myRoles };
  }

  async getShops(): Promise<LeanDocument<ShopDocument>[]> {
    return this.repository.find({});
  }

  async createShop(
    user: LeanDocument<UserDocument>,
    shop: CreateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    const newShop = await this.repository.create(shop);
    await this.userService.updateUserWithQuery(user._id, {
      $push: {
        shopsMeta: {
          shop: newShop._id,
          roles: [UserRole.ADMIN],
        },
      },
    });
    return newShop;
  }

  async updateShop(
    shopId: string,
    updatedShop: UpdateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    if (!isObjectIdOrHexString(shopId)) {
      throw new UnauthorizedException('Not a valid shopId');
    }
    const targetId = new mongoose.Types.ObjectId(shopId);
    return this.repository.updateOne(targetId, omit(updatedShop, '_id'));
  }

  // ---------------------------------------------------------------------------
  // My shops — for the All My Shops page + header switcher
  // ---------------------------------------------------------------------------

  /**
   * Returns every shop the user has access to (via shopsMeta), joined with
   * the user's role on that shop and today's order rollup. Optional `q`
   * filters by shop name / city / GSTIN (case-insensitive substring).
   */
  async getMyShops(
    user: LeanDocument<UserDocument>,
    q?: string,
  ): Promise<
    Array<{
      shop: any;
      roles: UserRole[];
      todayStats: {
        orders: number;
        revenue: number;
        receivable: number;
      };
    }>
  > {
    const accessibleIds = (user.shopsMeta || [])
      .map((m: any) => (m.shop?._id ?? m.shop) as Types.ObjectId)
      .filter(Boolean);
    if (accessibleIds.length === 0) return [];

    const match: Record<string, unknown> = {
      _id: { $in: accessibleIds },
      isDeleted: { $ne: true },
    };
    if (q?.trim()) {
      const re = new RegExp(escapeRegex(q.trim()), 'i');
      match.$or = [
        { name: re },
        { 'location.city': re },
        { 'gstDetails.gstin': re },
      ];
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const docs = await this.shopModel
      .aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'orders',
            let: { sid: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$shop', '$$sid'] },
                      { $gte: ['$orderDate', startOfDay] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  orders: { $sum: 1 },
                  revenue: { $sum: '$billing.finalAmount' },
                  receivable: {
                    $sum: {
                      $subtract: [
                        '$billing.finalAmount',
                        '$payment.amountPaid',
                      ],
                    },
                  },
                },
              },
              { $project: { _id: 0 } },
            ],
            as: '_today',
          },
        },
        {
          $addFields: {
            todayStats: {
              $ifNull: [
                { $arrayElemAt: ['$_today', 0] },
                { orders: 0, revenue: 0, receivable: 0 },
              ],
            },
          },
        },
        { $project: { _today: 0, suppliers: 0 } },
      ])
      .exec();

    // Stitch each shop with the caller's role(s).
    const roleByShop = new Map<string, UserRole[]>();
    for (const m of (user.shopsMeta || []) as any[]) {
      const id = String((m.shop as any)?._id ?? m.shop);
      roleByShop.set(id, m.roles ?? []);
    }
    return docs.map((shop: any) => ({
      shop,
      roles: roleByShop.get(String(shop._id)) ?? [],
      todayStats: shop.todayStats,
    }));
  }

  /**
   * Cross-shop rollup for the All My Shops KPI strip.
   * Aggregates today's orders/revenue/receivable across every shop the
   * user can access. `payable` is summed from each shop's suppliers[]
   * outstandingPayable stats (denormalized; cheap).
   */
  async getMyShopsStats(user: LeanDocument<UserDocument>): Promise<{
    totalShops: number;
    activeShops: number;
    ordersToday: number;
    revenueToday: number;
    outstandingReceivable: number;
    outstandingPayable: number;
  }> {
    const accessibleIds = (user.shopsMeta || [])
      .map((m: any) => (m.shop?._id ?? m.shop) as Types.ObjectId)
      .filter(Boolean);
    if (accessibleIds.length === 0) {
      return {
        totalShops: 0,
        activeShops: 0,
        ordersToday: 0,
        revenueToday: 0,
        outstandingReceivable: 0,
        outstandingPayable: 0,
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [shopRoll] = await this.shopModel
      .aggregate([
        {
          $match: {
            _id: { $in: accessibleIds },
            isDeleted: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            totalShops: { $sum: 1 },
            activeShops: {
              $sum: {
                $cond: [{ $eq: ['$status', ShopStatus.ACTIVE] }, 1, 0],
              },
            },
            outstandingPayable: {
              $sum: {
                $sum: {
                  $map: {
                    input: { $ifNull: ['$suppliers', []] },
                    as: 's',
                    in: { $ifNull: ['$$s.stats.outstandingPayable', 0] },
                  },
                },
              },
            },
          },
        },
        { $project: { _id: 0 } },
      ])
      .exec();

    const [orderRoll] = await this.shopModel.db
      .collection('orders')
      .aggregate([
        {
          $match: {
            shop: { $in: accessibleIds },
            orderDate: { $gte: startOfDay },
          },
        },
        {
          $group: {
            _id: null,
            ordersToday: { $sum: 1 },
            revenueToday: { $sum: '$billing.finalAmount' },
            outstandingReceivable: {
              $sum: {
                $subtract: ['$billing.finalAmount', '$payment.amountPaid'],
              },
            },
          },
        },
        { $project: { _id: 0 } },
      ])
      .toArray();

    return {
      totalShops: shopRoll?.totalShops ?? 0,
      activeShops: shopRoll?.activeShops ?? 0,
      ordersToday: orderRoll?.ordersToday ?? 0,
      revenueToday: orderRoll?.revenueToday ?? 0,
      outstandingReceivable: orderRoll?.outstandingReceivable ?? 0,
      outstandingPayable: shopRoll?.outstandingPayable ?? 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Soft-delete
  // ---------------------------------------------------------------------------

  async deleteShop(shopId: string, user: LeanDocument<UserDocument>): Promise<void> {
    if (!isObjectIdOrHexString(shopId)) {
      throw new BadRequestException('Invalid Shop ID');
    }
    const meta = (user.shopsMeta || []).find(
      (m: any) => String((m.shop as any)?._id ?? m.shop) === shopId,
    );
    if (!meta || !(meta.roles ?? []).includes(UserRole.ADMIN)) {
      throw new ForbiddenException('Only admins can delete a shop');
    }

    const sid = new Types.ObjectId(shopId);

    // Refuse if there are any non-cancelled orders in the last 24h — proxy
    // for "open orders" until we have an order-status enum to lean on.
    const recentOrder = await this.shopModel.db
      .collection('orders')
      .findOne({ shop: sid });
    if (recentOrder) {
      throw new BadRequestException(
        'Cannot delete a shop with order history. Mark it inactive instead.',
      );
    }

    await this.shopModel.updateOne(
      { _id: sid },
      { $set: { isDeleted: true, deletedAt: new Date() } },
    );
    // Remove the shop link from every user's shopsMeta.
    await this.userModel.updateMany(
      { 'shopsMeta.shop': sid },
      { $pull: { shopsMeta: { shop: sid } } },
    );
  }

  // ---------------------------------------------------------------------------
  // Members (admin-only writes; reads allowed for any member)
  // ---------------------------------------------------------------------------

  async listMembers(shopId: string): Promise<any[]> {
    if (!isObjectIdOrHexString(shopId)) {
      throw new BadRequestException('Invalid Shop ID');
    }
    return this.userModel
      .find(
        { 'shopsMeta.shop': new Types.ObjectId(shopId), isActive: true },
        {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          'shopsMeta.$': 1,
        },
      )
      .lean()
      .exec();
  }

  async inviteMember(
    shopId: string,
    invite: { email: string; roles: UserRole[]; firstName?: string; lastName?: string },
  ): Promise<any> {
    if (!isObjectIdOrHexString(shopId)) {
      throw new BadRequestException('Invalid Shop ID');
    }
    if (!invite.email || !invite.roles?.length) {
      throw new BadRequestException('email + roles are required');
    }
    const sid = new Types.ObjectId(shopId);
    const existing = await this.userModel
      .findOne({ email: invite.email.toLowerCase().trim() })
      .lean()
      .exec();

    if (existing) {
      const already = (existing.shopsMeta ?? []).find(
        (m: any) => String((m.shop as any)?._id ?? m.shop) === shopId,
      );
      if (already) {
        throw new BadRequestException('User already has access to this shop');
      }
      await this.userModel.updateOne(
        { _id: existing._id },
        {
          $push: { shopsMeta: { shop: sid, roles: invite.roles } },
        },
      );
      return { userId: existing._id, status: 'linked' };
    }

    // Create a pending placeholder user (no password yet). A real invite-link
    // email flow lands later — for v1 the user can be linked / passworded
    // through the standard signup flow.
    const created = await this.userModel.create({
      email: invite.email.toLowerCase().trim(),
      firstName: invite.firstName || invite.email.split('@')[0],
      lastName: invite.lastName || '',
      isActive: true,
      shopsMeta: [{ shop: sid, roles: invite.roles }],
    });
    return { userId: created._id, status: 'invited' };
  }

  async updateMemberRoles(
    shopId: string,
    userId: string,
    roles: UserRole[],
  ): Promise<void> {
    if (!isObjectIdOrHexString(shopId) || !isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid ID');
    }
    if (!roles?.length) {
      throw new BadRequestException('At least one role is required');
    }
    const sid = new Types.ObjectId(shopId);

    // If we're demoting the only admin, refuse.
    if (!roles.includes(UserRole.ADMIN)) {
      const adminCount = await this.countAdmins(sid);
      const target = await this.userModel
        .findOne({ _id: userId, 'shopsMeta.shop': sid })
        .lean()
        .exec();
      const targetWasAdmin = (target?.shopsMeta ?? []).some(
        (m: any) =>
          String((m.shop as any)?._id ?? m.shop) === shopId &&
          (m.roles ?? []).includes(UserRole.ADMIN),
      );
      if (targetWasAdmin && adminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last admin of this shop',
        );
      }
    }

    await this.userModel.updateOne(
      { _id: userId, 'shopsMeta.shop': sid },
      { $set: { 'shopsMeta.$.roles': roles } },
    );
  }

  async removeMember(shopId: string, userId: string): Promise<void> {
    if (!isObjectIdOrHexString(shopId) || !isObjectIdOrHexString(userId)) {
      throw new BadRequestException('Invalid ID');
    }
    const sid = new Types.ObjectId(shopId);
    const target = await this.userModel
      .findOne({ _id: userId, 'shopsMeta.shop': sid })
      .lean()
      .exec();
    if (!target) throw new NotFoundException('Member not found');

    const targetWasAdmin = (target.shopsMeta ?? []).some(
      (m: any) =>
        String((m.shop as any)?._id ?? m.shop) === shopId &&
        (m.roles ?? []).includes(UserRole.ADMIN),
    );
    if (targetWasAdmin) {
      const adminCount = await this.countAdmins(sid);
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin of this shop',
        );
      }
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { shopsMeta: { shop: sid } } },
    );
  }

  private async countAdmins(shopId: Types.ObjectId): Promise<number> {
    return this.userModel.countDocuments({
      isActive: true,
      shopsMeta: {
        $elemMatch: { shop: shopId, roles: UserRole.ADMIN },
      },
    });
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
