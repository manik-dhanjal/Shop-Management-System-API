import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ShopRepository } from './repository/shops.repository';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import mongoose, { isObjectIdOrHexString } from 'mongoose';
import { UpdateShopDto } from './dto/update-shop.dto';
import { omit } from 'lodash';
import { UserService } from '@api/user/user.service';
import { UserDocument } from '@api/user/schema/user.schema';
import { UserRole } from '@api/user/enum/user-role.enum';

@Injectable()
export class ShopService {
  constructor(
    private readonly repository: ShopRepository,
    private readonly userService: UserService,
  ) {}

  async getShopById(shopId: string): Promise<LeanDocument<ShopDocument>> {
    if (!isObjectIdOrHexString(shopId))
      throw new NotFoundException('Invalid Shop ID');
    return this.repository.findOne({ _id: shopId }, {}, {}, ['suppliers']);
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
}
