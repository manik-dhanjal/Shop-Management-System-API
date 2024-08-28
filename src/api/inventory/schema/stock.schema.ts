import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Stock {
  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({
    type: String,
    required: true,
  })
  unit: string;
}
