import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

@Schema({ timestamps: true })
export class PaymentDetails extends Document {
  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, required: true })
  status: PaymentStatus;

  @Prop({ type: Number, required: true, min: 0 })
  amountPaid: number;

  @Prop({ type: String, required: false })
  transactionId?: string;

  @Prop({ type: String, required: false })
  notes?: string;

  @Prop({ type: Date, required: true })
  paymentDate: Date;
}

export const PaymentDetailsSchema =
  SchemaFactory.createForClass(PaymentDetails);
