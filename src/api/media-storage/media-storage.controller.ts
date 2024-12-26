import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaStorageService } from './media-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaMetadataDocument } from './schema/media-metadata.schema';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { CreateMediaMetadata } from './dto/create-media-metadata.dto';

@Controller('/shop/:shopId/media-storage')
export class MediaStorageController {
  constructor(private readonly mediaStorageService: MediaStorageService) {}

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('shopId') shopId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // Max size: 3 MB
          new FileTypeValidator({ fileType: /^image\/*/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createMediaMetadata: CreateMediaMetadata,
  ): Promise<LeanDocument<MediaMetadataDocument>> {
    return this.mediaStorageService.uploadImage(
      shopId,
      file,
      createMediaMetadata,
    );
  }
}
