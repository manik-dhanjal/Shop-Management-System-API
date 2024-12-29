import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { Shop, ShopDocument } from '../schema/shop.schema';

@Injectable()
export class ShopRepository extends CoreRepository<ShopDocument> {
  constructor(
    @InjectModel(Shop.name)
    readonly model: Model<ShopDocument>,
  ) {
    super(model);
  }
}
