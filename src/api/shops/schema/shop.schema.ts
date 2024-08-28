import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Location } from 'src/shared/schema/location.schema';

export type ShopDocument = HydratedDocument<Shop>;

@Schema()
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
    required: true,
  })
  ownerName: string;

  @Prop({
    type: String,
    required: false,
  })
  gstin?: string;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
