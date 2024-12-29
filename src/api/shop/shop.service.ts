import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopRepository } from './repository/shops.repository';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import mongoose, { isObjectIdOrHexString } from 'mongoose';
import { UpdateShopDto } from './dto/update-shop.dto';
import { omit } from 'lodash';

@Injectable()
export class ShopService {
  constructor(readonly repository: ShopRepository) {}

  async getShopById(id: string): Promise<LeanDocument<ShopDocument>> {
    if (!isObjectIdOrHexString(id))
      throw new NotFoundException('Invalid Shop ID');
    return this.repository.findOne({ _id: id }, {}, {}, ['suppliers']);
  }

  async getShops(): Promise<LeanDocument<ShopDocument>[]> {
    return this.repository.find({});
  }

  async createShop(
    newShop: CreateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.repository.create(newShop);
  }

  async updateShop(
    updatedShop: UpdateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    const targetId = new mongoose.Types.ObjectId(updatedShop._id);
    return this.repository.updateOne(targetId, omit(updatedShop, '_id'));
  }
}
