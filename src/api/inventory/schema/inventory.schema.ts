import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from 'src/api/products/schema/product.schema';
import { Shop } from '@api/shop/schema/shop.schema';
import { Stock } from './stock.schema';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema()
export class Inventory {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: Product;

  @Prop({
    type: Number,
    required: true,
  })
  purchasePrice: number;

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
  supplier: Shop;

  @Prop({
    type: Stock,
    required: true,
  })
  stock: Stock;

  @Prop({
    type: String,
    required: true,
  })
  invoice: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
