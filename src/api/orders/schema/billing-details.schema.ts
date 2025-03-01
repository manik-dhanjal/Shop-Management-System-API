import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaxDetail, TaxDetailSchema } from './tax-detail.schema';

export type BillingDetailsDocument = HydratedDocument<BillingDetails>;

@Schema({ _id: false })
export class BillingDetails {
  @Prop({ required: true, min: 0, type: Number })
  subTotal: number;

  @Prop({ required: true, min: 0, type: Number })
  discounts: number;

  @Prop({ type: [TaxDetailSchema], default: [] })
  taxes: TaxDetail[];

  @Prop({ required: true, min: 0, type: Number })
  grandTotal: number;

  @Prop({ required: true, type: Number })
  roundOff: number;

  @Prop({ required: true, min: 0, type: Number })
  finalAmount: number;
}

export const BillingDetailsSchema =
  SchemaFactory.createForClass(BillingDetails);
