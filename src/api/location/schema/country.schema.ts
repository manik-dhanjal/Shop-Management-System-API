import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryDocument = Country & Document;

@Schema({ collection: 'countries', timestamps: true })
export class Country {
  @Prop({ type: String, required: true, unique: true, index: true })
  code: string; // ISO 3166-1 alpha-2, e.g. "IN"

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  dialCode?: string;

  @Prop({ type: String })
  currency?: string;

  @Prop({ type: Boolean, default: false })
  hasStates: boolean;

  @Prop({ type: Boolean, default: false })
  hasGstin: boolean;

  @Prop({ type: Number, default: 999 })
  sortOrder: number;

  @Prop({ type: String })
  pincodeRegex?: string;

  // GST / tax metadata — dormant until GST module ships
  @Prop({ type: String, enum: ['GST', 'VAT', 'SALES_TAX', 'NONE'], default: 'NONE' })
  taxRegime: string;

  @Prop({ type: String })
  gstinRegex?: string;

  @Prop({ type: String })
  gstinExample?: string;

  @Prop({ type: { startMonth: Number, startDay: Number }, _id: false })
  fiscalYear?: { startMonth: number; startDay: number };

  @Prop({ type: [Number] })
  taxSlabs?: number[];

  @Prop({ type: Number })
  registrationThreshold?: number;

  @Prop({ type: Number })
  compositionThreshold?: number;

  @Prop({ type: Number })
  eInvoiceThreshold?: number;

  @Prop({ type: String })
  filingPortalUrl?: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
CountrySchema.index({ sortOrder: 1, name: 1 });
