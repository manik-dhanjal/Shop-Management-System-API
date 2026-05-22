import { Prop, Schema } from '@nestjs/mongoose';

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

  @Prop({ type: String, required: false })
  address?: string;

  @Prop({ type: String, required: false })
  state?: string;

  @Prop({ type: Date, required: false })
  registrationDate?: Date;

  @Prop({ type: String, enum: GstStatus, required: false })
  status?: GstStatus;

  @Prop({ type: String, required: false })
  username?: string;

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: String, required: true })
  panCardNumber: string;
}
