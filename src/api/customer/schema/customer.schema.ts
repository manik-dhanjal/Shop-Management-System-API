import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Location } from '@shared/schema/location.schema';
import { Shop } from '@api/shop/schema/shop.schema';
import { CustomerType } from '../enum/customer-type.enum';
import { CustomerStatus } from '../enum/customer-status.enum';
import { GstRegistrationType } from '../enum/gst-registration-type.enum';
import { PaymentTerms } from '../enum/payment-terms.enum';
import { CustomerSource } from '../enum/customer-source.enum';
import { CustomerStats, CustomerStatsSchema } from './customer-stats.schema';
import { User } from '@api/user/schema/user.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({
  timestamps: true,
})
export class Customer {
  // -------- IDENTITY --------
  @Prop({ type: String, required: false })
  customerCode?: string; // CUST/0001, auto-generated per shop

  @Prop({ type: String, required: true })
  name: string;

  /** Required on Tax Invoices when it differs from display `name` (must match GSTIN registry). */
  @Prop({ type: String, required: false })
  legalName?: string;

  @Prop({
    type: String,
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  type: CustomerType;

  @Prop({
    type: String,
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  // -------- CONTACT --------
  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: [String], default: [] })
  alternatePhones: string[];

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: [String], default: [] })
  alternateEmails: string[];

  /** For BUSINESS customers — purchase contact name */
  @Prop({ type: String, required: false })
  contactPersonName?: string;

  @Prop({ type: String, required: false })
  contactPersonDesignation?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: MediaMetadata.name,
    required: false,
  })
  profileImage?: Types.ObjectId;

  // -------- GST & TAX --------
  @Prop({
    type: String,
    enum: GstRegistrationType,
    default: GstRegistrationType.CONSUMER,
  })
  gstRegistrationType: GstRegistrationType;

  @Prop({
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    required: false,
  })
  gstin?: string;

  /** 10-char PAN. Auto-derivable from GSTIN[2..12] when GSTIN exists. */
  @Prop({
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    required: false,
  })
  pan?: string;

  /** 2-digit Indian state code used as place of supply (defaults from GSTIN). */
  @Prop({ type: String, required: false })
  placeOfSupplyStateCode?: string;

  /** Default invoice classification at order time. */
  @Prop({ type: String, required: false })
  taxInvoicePreference?: string;

  @Prop({ type: Boolean, default: false })
  reverseChargeApplicable: boolean;

  @Prop({ type: Boolean, default: false })
  isExempt: boolean;

  // -------- ADDRESSES --------
  @Prop({ type: Location, required: false })
  billingAddress?: Location;

  /** Multiple shipping addresses for multi-location B2B customers. */
  @Prop({ type: [Location], default: [] })
  shippingAddresses: Location[];

  @Prop({ type: Number, required: false })
  defaultShippingAddressIndex?: number;

  /**
   * Legacy single shipping address. Kept for backward compatibility; new
   * code should use `shippingAddresses[defaultShippingAddressIndex]`.
   */
  @Prop({ type: Location, required: false })
  shippingAddress?: Location;

  // -------- BUSINESS TERMS --------
  @Prop({ type: Number, default: 0 })
  creditLimit: number;

  @Prop({ type: Number, default: 0 })
  creditPeriodDays: number;

  @Prop({
    type: String,
    enum: PaymentTerms,
    default: PaymentTerms.IMMEDIATE,
  })
  paymentTerms: PaymentTerms;

  @Prop({ type: Number, default: 0 })
  openingBalance: number;

  @Prop({ type: Number, default: 0 })
  discountPercentDefault: number;

  @Prop({ type: String, default: 'INR' })
  currency: string;

  // -------- CRM --------
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, required: false })
  notes?: string;

  @Prop({ type: Date, required: false })
  birthday?: Date;

  @Prop({ type: Date, required: false })
  anniversary?: Date;

  @Prop({
    type: String,
    enum: CustomerSource,
    default: CustomerSource.WALK_IN,
  })
  source: CustomerSource;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  })
  referredByCustomerId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  loyaltyPoints: number;

  // -------- DENORMALIZED STATS --------
  @Prop({ type: CustomerStatsSchema, default: () => ({}) })
  stats: CustomerStats;

  // -------- TENANT + AUDIT --------
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  createdBy?: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  updatedBy?: Types.ObjectId;

  // -------- SOFT DELETE --------
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  deletedBy?: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// -------- INDEXES --------
// Per-shop uniqueness on phone and code; sparse unique on GSTIN (allows nulls).
CustomerSchema.index({ shop: 1, phone: 1 }, { unique: true });
CustomerSchema.index(
  { shop: 1, gstin: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { gstin: { $type: 'string' } },
  },
);
CustomerSchema.index(
  { shop: 1, customerCode: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { customerCode: { $type: 'string' } },
  },
);
// Fast list filters
CustomerSchema.index({ shop: 1, isDeleted: 1, status: 1 });
CustomerSchema.index({ shop: 1, 'stats.lastOrderAt': -1 });
CustomerSchema.index({ shop: 1, 'stats.totalBilled': -1 });
