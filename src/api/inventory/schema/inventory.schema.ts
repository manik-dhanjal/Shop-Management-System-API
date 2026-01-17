import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { mongo } from 'mongoose';
import { Shop } from '@api/shop/schema/shop.schema';
import { MeasuringUnit } from '@api/products/enum/measuring-unit.enum';

export type InventoryDocument = mongoose.HydratedDocument<Inventory>;

@Schema({ _id: true, timestamps: true })
export class Inventory {
  _id: mongoose.Types.ObjectId;

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
  initialQuantity: number;

  @Prop({
    type: Number,
    required: true,
  })
  currentQuantity: number;

  @Prop({
    type: String,
    required: true,
  })
  measuringUnit: MeasuringUnit;

  @Prop({
    type: String,
    required: true,
  })
  invoiceUrl: string;

  @Prop({
    type: Date,
    required: true,
  })
  purchasedAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: mongoose.Types.ObjectId;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
