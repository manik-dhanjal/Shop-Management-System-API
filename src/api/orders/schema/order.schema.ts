import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderItem, OrderItemSchema } from './order-item.schema';
import { Shop } from '@api/shop/schema/shop.schema';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '@api/user/schema/user.schema';
import { Customer } from '@api/customer/schema/customer.schema';
import { InvoiceType } from '../enum/invoice-type.enum';
import { BillingDetails, BillingDetailsSchema } from './billing-details.schema';
import { PaymentDetails, PaymentDetailsSchema } from './payment.detail.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ required: true, unique: true, type: String })
  invoiceId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.name,
    required: true,
  })
  customer: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  billedBy: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Types.ObjectId;

  @Prop({ type: String, enum: InvoiceType, required: true })
  invoiceType: InvoiceType;

  @Prop({
    type: [OrderItemSchema],
    required: true,
  })
  items: OrderItem[];

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({ type: BillingDetailsSchema, required: true })
  billing: BillingDetails;

  @Prop({ type: PaymentDetailsSchema, required: true })
  payment: PaymentDetails;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
