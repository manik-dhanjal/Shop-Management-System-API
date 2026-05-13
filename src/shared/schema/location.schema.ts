import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class Location {
  @Prop({
    type: String,
    required: true,
  })
  address: string;

  /** Optional second address line (suite, building, etc.) */
  @Prop({
    type: String,
    required: false,
  })
  addressLine2?: string;

  @Prop({
    type: String,
    required: true,
  })
  country: string;

  @Prop({
    type: String,
    required: true,
  })
  state: string;

  /**
   * 2-digit Indian GST state code (e.g. "27" for Maharashtra).
   * Drives place-of-supply / intra-vs-inter-state determination on Tax Invoices.
   */
  @Prop({
    type: String,
    required: false,
  })
  stateCode?: string;

  @Prop({
    type: String,
    required: true,
  })
  city: string;

  @Prop({
    type: String,
    required: true,
  })
  pinCode: string;
}
