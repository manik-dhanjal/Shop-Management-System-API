import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { PaymentTerms } from '@api/customer/enum/payment-terms.enum';
import { SupplierStats, SupplierStatsSchema } from './supplier-stats.schema';
import { SupplierStatus } from '../enum/supplier-status.enum';

/**
 * Per-relationship metadata for the suppliers a buying shop tracks.
 *
 * Stored as a subdoc in `Shop.suppliers[]` — the buying shop owns this
 * relationship row, while the supplier identity itself (name, address,
 * GSTIN, contact) lives on the supplier's own Shop document referenced
 * by `supplierShop`.
 */
@Schema({ timestamps: true })
export class SupplierLink {
  /** Mongo auto-assigns this for subdocs; declared here so TS sees it. */
  _id?: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  })
  supplierShop: Types.ObjectId;

  /** SUP/NNNN — auto-generated per buying shop. */
  @Prop({ type: String, required: false })
  supplierCode?: string;

  /** Optional override label for this supplier inside this shop's UI. */
  @Prop({ type: String, required: false })
  alias?: string;

  @Prop({
    type: String,
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @Prop({
    type: String,
    enum: PaymentTerms,
    default: PaymentTerms.IMMEDIATE,
  })
  paymentTerms: PaymentTerms;

  @Prop({ type: Number, default: 0 })
  creditLimit: number;

  @Prop({ type: Number, default: 0 })
  creditPeriodDays: number;

  /** What we owed the supplier before SMS was introduced. */
  @Prop({ type: Number, default: 0 })
  openingBalance: number;

  @Prop({ type: Number, default: 0 })
  defaultDiscountPct: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, required: false })
  notes?: string;

  /**
   * Override contact for this relationship. Useful when an in-system shop
   * has a generic phone but we want the sales rep we deal with.
   */
  @Prop({
    type: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    required: false,
    _id: false,
  })
  primaryContact?: { name?: string; phone?: string; email?: string };

  @Prop({ type: SupplierStatsSchema, default: () => ({}) })
  stats: SupplierStats;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  addedBy?: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  deletedBy?: Types.ObjectId;
}

export const SupplierLinkSchema = SchemaFactory.createForClass(SupplierLink);
