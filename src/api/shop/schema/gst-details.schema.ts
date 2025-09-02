import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum GstStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  CANCELLED = 'Cancelled',
}

@Schema({
  timestamps: true,
  _id: false,
})
export class GstDetails {
  @Prop({ type: String, required: true, unique: true })
  gstin: string;

  @Prop({ type: String, required: true })
  legalName: string;

  @Prop({ type: String, required: false })
  tradeName?: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: Date, required: true })
  registrationDate: Date;

  @Prop({ type: String, enum: GstStatus, required: true })
  status: GstStatus;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  panCardNumber: string;
}
