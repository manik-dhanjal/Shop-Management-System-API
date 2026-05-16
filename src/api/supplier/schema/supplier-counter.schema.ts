import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type SupplierCounterDocument = HydratedDocument<SupplierCounter>;

@Schema({ timestamps: true })
export class SupplierCounter {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    unique: true,
  })
  shop: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  lastNumber: number;
}

export const SupplierCounterSchema =
  SchemaFactory.createForClass(SupplierCounter);
