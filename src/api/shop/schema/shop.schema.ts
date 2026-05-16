import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Location } from '@shared/schema/location.schema';
import { GstDetails } from './gst-details.schema';
import { ShopKind } from '../enum/shop-kind.enum';
import {
  SupplierLink,
  SupplierLinkSchema,
} from '@api/supplier/schema/supplier-link.schema';

export type ShopDocument = HydratedDocument<Shop>;

@Schema({
  timestamps: true,
})
export class Shop {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  /**
   * Distinguishes a tenant shop (SELF_OPERATED) from a lightweight Shop doc
   * a tenant created to represent an outside supplier (EXTERNAL_SUPPLIER).
   * External suppliers carry contact/GST/address but are not themselves
   * tenants — no users attach.
   */
  @Prop({
    type: String,
    enum: ShopKind,
    default: ShopKind.SELF_OPERATED,
  })
  kind: ShopKind;

  @Prop({ type: Location })
  location: Location;

  @Prop({
    type: GstDetails,
    required: false,
  })
  gstDetails?: GstDetails;

  // -------- Contact (used mostly when kind === EXTERNAL_SUPPLIER) --------
  @Prop({ type: String, required: false })
  phone?: string;

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: [String], default: [] })
  alternatePhones: string[];

  @Prop({ type: [String], default: [] })
  alternateEmails: string[];

  @Prop({ type: String, required: false })
  contactPersonName?: string;

  @Prop({ type: String, required: false })
  contactPersonDesignation?: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        designation: { type: String },
        phone: { type: String },
        email: { type: String },
      },
    ],
    default: [],
  })
  contactPersons: Array<{
    name: string;
    designation?: string;
    phone?: string;
    email?: string;
  }>;

  // -------- Per-relationship subdocs for this shop's suppliers --------
  /**
   * One-to-many mapping into the same collection. Each entry holds the
   * `supplierShop` ObjectId pointing at another Shop document plus
   * per-relationship metadata (terms, opening balance, stats, …).
   */
  @Prop({ type: [SupplierLinkSchema], default: [] })
  suppliers: SupplierLink[];

  // -------- Audit (mostly relevant for EXTERNAL_SUPPLIER shops) --------
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

// -------- Indexes --------
// Reverse lookup: "which buying shops link this supplier shop?"
ShopSchema.index({ 'suppliers.supplierShop': 1 });
// Per-relationship code uniqueness is enforced in the service layer
// (Mongo can't enforce uniqueness inside a single doc's array).
ShopSchema.index({ 'suppliers.supplierCode': 1 });
ShopSchema.index({ kind: 1 });
// Discovery: state-scoped + popular-in-state queries from the find-supplier picker.
ShopSchema.index({ kind: 1, 'location.state': 1 });
