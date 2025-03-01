import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from 'src/api/products/schema/product.schema';
import { Order } from './order.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from '@api/shop/schema/shop.schema';

@Schema({
  _id: false,
})
export class OrderItem {
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
  quantity: number;

  @Prop({
    type: String,
    required: true,
  })
  measuringUnit: string;

  @Prop({
    type: String,
    required: true,
  })
  currency: string;

  @Prop({
    type: Number,
    required: true,
  })
  price: number; // price of single unit, without discount and gst

  @Prop({
    type: Number,
    required: true,
  })
  discount?: number; //Discount applied to the item, if any

  @Prop({
    type: Number,
    required: true,
  })
  gstRate: number; //Applicable GST rate, e.g., 5%, 12%, 18%, 28%
}
