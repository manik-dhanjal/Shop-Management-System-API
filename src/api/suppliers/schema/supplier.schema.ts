import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Shop } from 'src/api/shops/schema/shop.schema';
import { Location } from 'src/shared/schema/location.schema';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema()
export class Supplier {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: Location,
    required: true,
  })
  location: Location;

  @Prop({
    type: String,
    required: false,
  })
  gstin?: string;

  @Prop({
    type: [Number],
    required: true,
    default: [],
  })
  phoneNumber: number[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Shop.name,
    required: true,
  })
  shop: Shop;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
