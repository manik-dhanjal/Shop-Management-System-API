import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Location } from '@shared/schema/location.schema';
import { Shop } from '@api/shop/schema/shop.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({
  timestamps: true,
})
export class Customer {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: false,
  })
  email?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: MediaMetadata.name,
    required: false,
  })
  profileImage?: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Types.ObjectId;

  @Prop({ type: Location, required: false })
  shippingAddress?: Location;

  @Prop({ type: Location, required: true })
  billingAddress: Location;

  @Prop({
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    required: false,
  })
  gstin?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
