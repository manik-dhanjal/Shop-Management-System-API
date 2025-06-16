import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Shop } from '@api/shop/schema/shop.schema';

@Schema({ _id: false })
export class Inventory {
  @Prop({
    type: Number,
    required: true,
  })
  purchasePrice: number;

  @Prop({
    type: Number,
    required: true,
  })
  sellPrice: Number;

  @Prop({
    type: String,
    required: true,
  })
  currency: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  supplier: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({
    type: String,
    required: true,
  })
  unit: string;

  @Prop({
    type: String,
    required: true,
  })
  invoiceUrl: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
