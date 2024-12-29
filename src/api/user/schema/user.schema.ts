import { MediaMetadata } from '@api/media-storage/schema/media-metadata.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';
import { Shop } from '@api/shops/schema/shop.schema';

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
    type: Number,
    required: false,
  })
  phone?: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: MediaMetadata.name,
    required: false,
  })
  profileImage?: MediaMetadata;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
  })
  role: UserRole;

  @Prop({ default: true, type: Boolean, required: false })
  isActive: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;
}

export const UserSchema = SchemaFactory.createForClass(User);
