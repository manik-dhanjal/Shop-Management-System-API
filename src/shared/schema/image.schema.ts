import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class Image {
  @Prop({
    type: String,
    required: true,
  })
  src: string;

  @Prop({
    type: String,
    required: false,
  })
  alt?: string;
}
