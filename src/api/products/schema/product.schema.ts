import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from 'src/api/shops/schema/shop.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ProductProperty {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  value: string;
}

@Schema()
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: [String], default: [], required: false })
  images: string[];

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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
