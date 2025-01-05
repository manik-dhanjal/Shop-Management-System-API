import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Location } from 'src/shared/schema/location.schema';

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

  @Prop({ type: Location })
  location: Location;

  @Prop({
    type: String,
    required: false,
  })
  gstin?: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Shop.name,
    required: true,
  })
  suppliers: Shop[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
