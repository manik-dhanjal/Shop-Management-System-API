import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

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
  profileImage?: MediaMetadata;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  shop: Shop;

  @Prop({ type: Location })
  location?: Location;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
