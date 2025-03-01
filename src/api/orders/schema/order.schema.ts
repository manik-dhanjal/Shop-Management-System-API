import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderItem } from './order-item.schema';
import { Shop } from '@api/shop/schema/shop.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrderPaymentStatus } from '../enum/order-payment-status.order';
import { User } from '@api/user/schema/user.schema';
import { Location } from '@shared/schema/location.schema';
import { Customer } from '@api/customer/schema/customer.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: String,
    required: true,
  })
  orderNumber: string; //invoice Number

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.name,
    required: true,
  })
  customer: Customer;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  billedBy: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: [OrderItem],
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
  gstTotal: number; // Total GST amount for the order

  @Prop({
    type: Number,
    required: true,
  })
  totalAmount: number; // Total amount for the order excluding GST

  @Prop({
    type: String,
    required: true,
  })
  paymentMethod: string; //  'Credit Card', 'PayPal', 'Bank Transfer', 'Cash'

  @Prop({
    type: String,
    enum: OrderPaymentStatus,
    required: true,
  })
  paymentStatus: OrderPaymentStatus; // 'Paid', 'Unpaid', 'Refunded'

  @Prop({
    type: String,
    required: false,
  })
  transactionId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
