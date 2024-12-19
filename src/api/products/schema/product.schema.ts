import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from 'src/api/shops/schema/shop.schema';
import { ProductProperty } from './product-property.schema';
import { Image } from '@shared/schema/image.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: [Image], default: [], required: false })
  images: Image[];

  @Prop({ type: String, required: true })
  hsn: string;

  @Prop({ type: String, required: false })
  brand: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: [String],
    required: false,
    default: [],
  })
  keywords: string[];

  @Prop({
    type: [ProductProperty],
    required: false,
    default: [],
  })
  properties: ProductProperty[];

  @Prop({
    type: Number,
    required: true,
  })
  igstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @Prop({
    type: Number,
    required: true,
  })
  cgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @Prop({
    type: Number,
    required: true,
  })
  sgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%
}

export const ProductSchema = SchemaFactory.createForClass(Product);
