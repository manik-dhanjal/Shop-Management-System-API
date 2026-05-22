import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDocument = City & Document;

const PincodeEntrySchema = {
  code: { type: String, required: true },
  isSezPincode: { type: Boolean },
  officeType: { type: String, enum: ['HO', 'SO', 'BO'] },
};

@Schema({ collection: 'cities', timestamps: true })
export class City {
  @Prop({ type: String, required: true, index: true })
  countryCode: string;

  @Prop({ type: String, required: true, index: true })
  stateCode: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [PincodeEntrySchema], default: [] })
  pincodes: Array<{
    code: string;
    isSezPincode?: boolean;
    officeType?: 'HO' | 'SO' | 'BO';
  }>;

  @Prop({ type: Boolean, default: false })
  isMajor: boolean;

  @Prop({ type: String, enum: ['city', 'town', 'village', 'metro'], default: 'city' })
  type: string;

  @Prop({ type: Number })
  population?: number;

  // GST metadata — dormant until GST module ships
  @Prop({ type: Boolean, default: false })
  isSez: boolean;

  @Prop({ type: String })
  sezName?: string;

  @Prop({ type: String })
  gstCommissionerate?: string;

  @Prop({ type: String })
  gstDivision?: string;

  @Prop({ type: String })
  gstRange?: string;
}

export const CitySchema = SchemaFactory.createForClass(City);

// Default city list: top cities first within a state
CitySchema.index({ countryCode: 1, stateCode: 1, isMajor: -1, population: -1 });

// Full-text search across name (used for ?q= queries)
CitySchema.index({ countryCode: 1, stateCode: 1, name: 'text' });

// Pincode reverse lookup
CitySchema.index({ countryCode: 1, 'pincodes.code': 1 });
