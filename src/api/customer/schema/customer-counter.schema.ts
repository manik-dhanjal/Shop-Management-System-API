import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Shop } from '@api/shop/schema/shop.schema';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type CustomerCounterDocument = HydratedDocument<CustomerCounter>;

@Schema({ timestamps: true })
export class CustomerCounter {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
    unique: true,
  })
  shop: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  lastNumber: number;
}

export const CustomerCounterSchema =
  SchemaFactory.createForClass(CustomerCounter);
