import { Prop, Schema } from '@nestjs/mongoose';
import { ConstitutionOfBusiness } from '../enum/constitution-of-business.enum';

export enum GstStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  CANCELLED = 'Cancelled',
}

@Schema({ _id: false })
export class GstDetails {
  // ── Required (always provided by admin) ─────────────────────────────────────
  @Prop({ type: String, required: true })
  gstin: string;

  // ── Portal-locked (populated + locked after OTP verify) ─────────────────────
  @Prop({ type: String, required: false })
  legalName?: string;

  @Prop({ type: String, required: false })
  tradeName?: string;

  @Prop({ type: String, required: false })
  panCardNumber?: string;

  @Prop({ type: String, required: false })
  address?: string;

  @Prop({ type: String, required: false })
  state?: string;

  @Prop({ type: Date, required: false })
  registrationDate?: Date;

  @Prop({ type: String, enum: GstStatus, required: false })
  status?: GstStatus;

  @Prop({ type: String, enum: ConstitutionOfBusiness, required: false })
  constitutionOfBusiness?: ConstitutionOfBusiness;

  @Prop({ type: Boolean, required: false })
  einvoiceApplicable?: boolean;

  @Prop({ type: [String], required: false })
  natureOfBusiness?: string[];

  @Prop({ type: Date, required: false })
  verifiedAt?: Date;

  // ── GST portal credentials (admin-managed) ───────────────────────────────────
  @Prop({ type: String, required: false })
  username?: string;

  @Prop({ type: String, required: false })
  email?: string;

  // ── Auth session (filing foundation — never sent to client) ─────────────────
  @Prop({ type: String, required: false, select: false })
  gstSessionToken?: string;

  @Prop({ type: Date, required: false, select: false })
  gstSessionExpiresAt?: Date;
}
