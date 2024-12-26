import { Module } from '@nestjs/common';
import { MediaStorageController } from './media-storage.controller';
import { MediaStorageService } from './media-storage.service';
import { MediaMetadataRepository } from './repository/media-metadata.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MediaMetadata,
  MediaMetadataSchema,
} from './schema/media-metadata.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaMetadata.name, schema: MediaMetadataSchema },
    ]),
  ],
  controllers: [MediaStorageController],
  providers: [MediaStorageService, MediaMetadataRepository],
  exports: [MediaStorageService],
})
export class MediaStorageModule {}
