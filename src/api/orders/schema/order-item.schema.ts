import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from 'src/api/products/schema/product.schema';
import { Order } from './order.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from 'src/api/shops/schema/shop.schema';

export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema()
export class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Order.name,
    required: true,
  })
  order: Order;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: Product;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({
    type: String,
    required: true,
  })
  quantityUnit: string;

  @Prop({
    type: String,
    required: true,
  })
  currency: string;

  @Prop({
    type: Number,
    required: true,
  })
  rate: number; // price of single item, without discount and gst

  @Prop({
    type: Number,
    required: true,
  })
  discount?: number; //Discount applied to the item, if any

  @Prop({
    type: Number,
    required: true,
  })
  totalAmount: number; //Total price for this item, considering quantity, discount and gst

  @Prop({
    type: Number,
    required: true,
  })
  gstAmount: number; //GST amount for this item

  @Prop({
    type: Number,
    required: true,
  })
  gstRate: number; //Applicable GST rate, e.g., 5%, 12%, 18%, 28%
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
