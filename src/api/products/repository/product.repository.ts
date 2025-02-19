import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schema/product.schema';

@Injectable()
export class ProductRepository extends CoreRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    readonly model: Model<ProductDocument>,
  ) {
    super(model);
  }
}
