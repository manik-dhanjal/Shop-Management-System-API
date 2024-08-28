import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Recipient {
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
}
