import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderItem } from './order-item.schema';
import { Shop } from 'src/api/shops/schema/shop.schema';
import { Recipient } from './recipient.schema';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
  @Prop({
    type: String,
    required: true,
  })
  orderNumber: string; //invoice Number

  @Prop({
    type: Date,
    required: true,
  })
  orderDate: Date;

  @Prop({
    type: Recipient,
    required: true,
  })
  recipient: Recipient;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: OrderItem.name,
    required: true,
  })
  items: OrderItem[];

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: Location,
    required: false,
  })
  placeOfSupply?: Location;

  @Prop({
    type: Number,
    required: true,
  })
  gst_total: number; // Total GST amount for the order

  @Prop({
    type: Number,
    required: true,
  })
  total_amount: number; // Total amount for the order excluding GST

  @Prop({
    type: String,
    required: true,
  })
  payment_method: string; //  'Credit Card', 'PayPal', 'Bank Transfer', 'Cash'

  @Prop({
    type: String,
    required: true,
  })
  payment_status: string; // 'Paid', 'Unpaid', 'Refunded'
}

export const OrderSchema = SchemaFactory.createForClass(Order);
