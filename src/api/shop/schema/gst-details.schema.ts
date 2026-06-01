import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GstDetails {
  @Prop({ type: String, required: true })
  gstin: string;

  @Prop({ type: String, required: false })
  legalName?: string;

  @Prop({ type: String, required: false })
  panCardNumber?: string;

  @Prop({ type: String, required: false })
  state?: string;
}
