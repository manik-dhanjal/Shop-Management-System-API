import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from 'src/api/products/schema/product.schema';
import mongoose, { Types } from 'mongoose';
import { TaxDetail, TaxDetailSchema } from './tax-detail.schema';

@Schema({
  _id: false,
})
export class OrderItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  sku: string;

  @Prop({ required: true, type: String })
  hsnCode: string;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({ required: true, min: 0, type: Number })
  unitPrice: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
    min: 0,
  })
  discount: number; //Discount applied to the item, if any

  @Prop({ required: true, min: 0, type: Number })
  taxableValue: number;

  @Prop({ type: [TaxDetailSchema], default: [] })
  taxes: TaxDetail[];

  @Prop({ required: true, min: 0, type: Number })
  totalPrice: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
