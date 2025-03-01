import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaxType } from '../enum/tax-type.enum';

export type TaxDetailDocument = HydratedDocument<TaxDetail>;

@Schema({ _id: false })
export class TaxDetail {
  @Prop({ required: true, enum: TaxType, type: String })
  type: TaxType; // CGST, SGST, IGST

  @Prop({ required: true, min: 0 })
  rate: number; // In percentage

  @Prop({ required: true, min: 0 })
  amount: number;
}

export const TaxDetailSchema = SchemaFactory.createForClass(TaxDetail);
