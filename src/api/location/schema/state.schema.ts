import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema({ collection: 'states', timestamps: true })
export class State {
  @Prop({ type: String, required: true, index: true })
  countryCode: string; // "IN"

  @Prop({ type: String, required: true })
  code: string; // "27" (GST state code for India) or ISO 3166-2 sub-tag

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: 'State' })
  type: string; // "State" | "Union Territory" | "Province"

  // GST metadata — dormant until GST module ships
  @Prop({ type: Boolean, default: false })
  isUnionTerritory: boolean;

  @Prop({ type: String, enum: ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NE', 'CENTRAL'] })
  gstZone?: string;

  @Prop({ type: Number })
  eWayBillIntraThreshold?: number;

  @Prop({ type: Boolean, default: false })
  professionalTaxApplicable: boolean;

  @Prop({
    type: [{ minMonthlyIncome: Number, tax: Number, _id: false }],
  })
  professionalTaxSlabs?: Array<{ minMonthlyIncome: number; tax: number }>;

  @Prop({ type: String })
  taxPortalUrl?: string;

  @Prop({ type: Boolean, default: true })
  compositionAllowed: boolean;
}

export const StateSchema = SchemaFactory.createForClass(State);
StateSchema.index({ countryCode: 1, code: 1 }, { unique: true });
StateSchema.index({ countryCode: 1, name: 1 });
