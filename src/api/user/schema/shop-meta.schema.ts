import { Shop } from '@api/shop/schema/shop.schema';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserRole } from '../enum/user-role.enum';

@Schema({ _id: false })
export class ShopMeta {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;

  @Prop({
    type: [String],
    enum: UserRole,
    required: true,
  })
  roles: UserRole[];
}
