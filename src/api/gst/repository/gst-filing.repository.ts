import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { GstFiling, GstFilingDocument } from '../schema/gst-filing.schema';

@Injectable()
export class GstFilingRepository extends CoreRepository<GstFilingDocument> {
  constructor(
    @InjectModel(GstFiling.name)
    readonly model: Model<GstFilingDocument>,
  ) {
    super(model);
  }
}
