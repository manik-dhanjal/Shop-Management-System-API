import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GstDetails {
  @Prop({ type: String, required: true })
  gstin: string;

  @Prop({ type: String, required: true })
  legalName: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  panCardNumber: string;

  @Prop({ type: String, required: true })
  stateCode: string;
}
