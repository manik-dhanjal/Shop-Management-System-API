import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Denormalized read-side counters for list filters and the customer detail
 * overview. Updated by `OrderService` on create/payment/void so we never
 * aggregate orders on a list-page request.
 */
@Schema({ _id: false })
export class CustomerStats {
  @Prop({ type: Number, default: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0 })
  totalBilled: number; // ₹ lifetime

  @Prop({ type: Number, default: 0 })
  totalPaid: number; // ₹ lifetime

  @Prop({ type: Number, default: 0 })
  outstandingBalance: number; // billed − paid + openingBalance

  @Prop({ type: Date, required: false })
  firstOrderAt?: Date;

  @Prop({ type: Date, required: false })
  lastOrderAt?: Date;

  @Prop({ type: Number, default: 0 })
  avgOrderValue: number;
}

export const CustomerStatsSchema = SchemaFactory.createForClass(CustomerStats);
