import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import {
  MediaMetadata,
  MediaMetadataDocument,
} from '../schema/media-metadata.schema';

@Injectable()
export class MediaMetadataRepository extends CoreRepository<MediaMetadataDocument> {
  constructor(
    @InjectModel(MediaMetadata.name)
    readonly model: Model<MediaMetadataDocument>,
  ) {
    super(model);
  }
}
