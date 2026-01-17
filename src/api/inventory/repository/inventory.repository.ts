import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { ProductDocument } from '@api/products/schema/product.schema';
import { Inventory, InventoryDocument } from '../schema/inventory.schema';

@Injectable()
export class InventoryRepository extends CoreRepository<InventoryDocument> {
  constructor(
    @InjectModel(Inventory.name)
    readonly model: Model<InventoryDocument>,
  ) {
    super(model);
  }
}
