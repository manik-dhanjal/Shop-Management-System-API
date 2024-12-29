import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ResourceType } from '../enum/resource-type.enum';
import { Shop } from '@api/shop/schema/shop.schema';

export type MediaMetadataDocument = HydratedDocument<MediaMetadata>;

@Schema({ timestamps: true })
export class MediaMetadata {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: String,
    required: false,
  })
  alt?: string;

  @Prop({ type: String, required: true })
  publicId: string;

  @Prop({ type: Number, required: true, min: 1 })
  width: number;

  @Prop({ type: Number, required: true, min: 1 })
  height: number;

  @Prop({ type: String, required: true })
  format: string;

  @Prop({ type: String, required: true, enum: ResourceType })
  resourceType: ResourceType;

  @Prop({ type: Number, required: true, min: 1 })
  bytes: number;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  secureUrl: string;

  @Prop({ type: String, required: true })
  folder: string;
}

export const MediaMetadataSchema = SchemaFactory.createForClass(MediaMetadata);
