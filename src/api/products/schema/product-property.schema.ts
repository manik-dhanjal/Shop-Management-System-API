import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ProductProperty {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  value: string;
}
