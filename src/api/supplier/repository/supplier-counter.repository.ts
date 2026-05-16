import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SupplierCounter,
  SupplierCounterDocument,
} from '../schema/supplier-counter.schema';

@Injectable()
export class SupplierCounterRepository {
  constructor(
    @InjectModel(SupplierCounter.name)
    private readonly model: Model<SupplierCounterDocument>,
  ) {}

  /**
   * Atomically increments and returns the next supplier number for a shop.
   * Upsert so the first call seeds the counter at 1.
   */
  async getNextNumber(shopId: Types.ObjectId): Promise<number> {
    const updated = await this.model.findOneAndUpdate(
      { shop: shopId },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true },
    );
    return updated.lastNumber;
  }

  /** Peeks the next code without incrementing — used to preview on Add form. */
  async peekNextNumber(shopId: Types.ObjectId): Promise<number> {
    const counter = await this.model.findOne({ shop: shopId });
    return (counter?.lastNumber ?? 0) + 1;
  }
}
