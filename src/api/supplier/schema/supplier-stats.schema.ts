import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Denormalized read-side counters for the supplier list/detail. Will be
 * updated by the future Purchase Order / GRN module via
 * `SupplierService.onPurchaseRecorded`. Kept here so the all-suppliers
 * KPI strip never has to aggregate purchase docs at request time.
 */
@Schema({ _id: false })
export class SupplierStats {
  @Prop({ type: Number, default: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0 })
  totalPurchased: number; // ₹ lifetime

  @Prop({ type: Number, default: 0 })
  totalPaid: number; // ₹ lifetime

  @Prop({ type: Number, default: 0 })
  outstandingPayable: number; // openingBalance + purchased − paid

  @Prop({ type: Date, required: false })
  firstPurchaseAt?: Date;

  @Prop({ type: Date, required: false })
  lastPurchaseAt?: Date;

  @Prop({ type: Number, default: 0 })
  avgOrderValue: number;
}

export const SupplierStatsSchema = SchemaFactory.createForClass(SupplierStats);
