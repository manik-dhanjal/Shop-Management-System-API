import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Shop } from '@api/shop/schema/shop.schema';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type InvoiceCounterDocument = HydratedDocument<InvoiceCounter>;

@Schema({ timestamps: true })
export class InvoiceCounter {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Types.ObjectId;

  @Prop({ type: String, required: true })
  financialYear: string; // e.g. "25-26"

  @Prop({ type: Number, required: true, default: 0 })
  lastNumber: number;
}

export const InvoiceCounterSchema =
  SchemaFactory.createForClass(InvoiceCounter);

InvoiceCounterSchema.index({ shop: 1, financialYear: 1 }, { unique: true });
