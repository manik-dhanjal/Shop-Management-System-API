import {
  CLOUDINARY_CONFIG_NAME,
  CloundinaryConfig,
} from '@config/cloudinary.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { MediaMetadataRepository } from './repository/media-metadata.repository';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { MediaMetadataDocument } from './schema/media-metadata.schema';
import { CreateMediaMetadata } from './dto/create-media-metadata.dto';

@Injectable()
export class MediaStorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaMetadataRepository: MediaMetadataRepository,
  ) {
    const cloundinaryConfig = this.configService.get<CloundinaryConfig>(
      CLOUDINARY_CONFIG_NAME,
    );
    cloudinary.config({
      cloud_name: cloundinaryConfig.cloudName,
      api_key: cloundinaryConfig.apiKey,
      api_secret: cloundinaryConfig.apiSecret, // Click 'View API Keys' above to copy your API secret
    });
  }

  async uploadImage(
    shopId: string,
    file: Express.Multer.File,
    otherMediaMetaData: CreateMediaMetadata,
  ): Promise<LeanDocument<MediaMetadataDocument>> {
    const response = await this.uploadFromBuffer(shopId, file.buffer);
    return this.mediaMetadataRepository.create({
      shop: shopId,
      publicId: response.public_id,
      width: response.width,
      height: response.height,
      format: response.format,
      resourceType: response.resource_type,
      bytes: response.bytes,
      url: response.url,
      secureUrl: response.secure_url,
      folder: response.folder,
      ...otherMediaMetaData,
    });
  }

  private uploadFromBuffer(
    folder: string,
    fileBuffer: Buffer,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        )
        .end(fileBuffer);
    });
  }
}
