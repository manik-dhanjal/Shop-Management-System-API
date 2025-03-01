import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Currency } from '@shared/enum/currency.enum';
import { HydratedDocument } from 'mongoose';

export type ExportDetailsDocument = HydratedDocument<ExportDetails>;

@Schema({ _id: false })
export class ExportDetails {
  @Prop({ default: false, type: Boolean })
  isExport: boolean;

  @Prop({ type: String, enum: Currency, required: false })
  currency?: Currency;

  @Prop({ min: 0, type: Number, required: false })
  exchangeRate?: number;

  @Prop({ type: String, required: false })
  shippingBillNumber?: string;

  @Prop({ type: String, required: false })
  shippingBillDate?: Date;
}

export const ExportDetailsSchema = SchemaFactory.createForClass(ExportDetails);
