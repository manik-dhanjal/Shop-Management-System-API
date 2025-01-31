import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ShopMeta } from './shop-meta.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
  })
  phone?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: MediaMetadata.name,
    required: false,
  })
  profileImage?: MediaMetadata;

  @Prop({
    type: String,
    required: false,
  })
  password?: string;

  @Prop({
    type: [ShopMeta],
    required: false,
    default: [],
  })
  shopsMeta: ShopMeta[];

  @Prop({ default: true, type: Boolean, required: false })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
