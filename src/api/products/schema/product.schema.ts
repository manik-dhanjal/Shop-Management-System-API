import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, mongo } from 'mongoose';
import { Shop } from '@api/shop/schema/shop.schema';
import { ProductProperty } from './product-property.schema';
import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { MeasuringUnit } from '../enum/measuring-unit.enum';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: MediaMetadata.name,
    default: [],
    required: false,
  })
  images: MediaMetadata[];

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

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    required: false,
    default: [],
  })
  inventory: mongoose.Types.ObjectId[];

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  stock: number;

  @Prop({
    type: String,
    required: true,
  })
  measuringUnit: MeasuringUnit; // e.g., pcs, kg, liters
}

export const ProductSchema = SchemaFactory.createForClass(Product);
