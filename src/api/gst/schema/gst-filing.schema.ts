import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from '@api/shop/schema/shop.schema';

export type GstFilingDocument = HydratedDocument<GstFiling>;

export enum GstFilingStatus {
  PENDING = 'PENDING',
  PREPARED = 'PREPARED',
  FILED = 'FILED',
  FAILED = 'FAILED',
}

export enum GstReturnType {
  GSTR1 = 'GSTR1',
  GSTR3B = 'GSTR3B',
}

@Schema({ _id: true, timestamps: true })
export class GstFiling {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  gstin: string;

  @Prop({ type: String, required: true })
  returnPeriod: string;

  @Prop({ type: String, enum: GstReturnType, required: true })
  returnType: GstReturnType;

  @Prop({ type: String, enum: GstFilingStatus, default: GstFilingStatus.PENDING })
  status: GstFilingStatus;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  preparedData?: Record<string, any>;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  aiSuggestions?: Record<string, any>;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
  filingResponse?: Record<string, any>;

  @Prop({ type: String, required: false })
  errorMessage?: string;

  @Prop({ type: Date, required: false })
  filedAt?: Date;
}

export const GstFilingSchema = SchemaFactory.createForClass(GstFiling);
