import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InvoiceCounter,
  InvoiceCounterDocument,
} from '../schema/invoice-counter.schema';

@Injectable()
export class InvoiceCounterRepository {
  constructor(
    @InjectModel(InvoiceCounter.name)
    private readonly model: Model<InvoiceCounterDocument>,
  ) {}

  /**
   * Atomically increments and returns the next invoice number for a shop within a financial year.
   * Uses upsert so the first call for a (shop, FY) initializes the counter.
   */
  async getNextNumber(
    shopId: Types.ObjectId,
    financialYear: string,
  ): Promise<number> {
    const updated = await this.model.findOneAndUpdate(
      { shop: shopId, financialYear },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true },
    );
    return updated.lastNumber;
  }

  /**
   * Peeks the next invoice number without incrementing — used to preview the ID in the UI.
   */
  async peekNextNumber(
    shopId: Types.ObjectId,
    financialYear: string,
  ): Promise<number> {
    const counter = await this.model.findOne({ shop: shopId, financialYear });
    return (counter?.lastNumber ?? 0) + 1;
  }
}
