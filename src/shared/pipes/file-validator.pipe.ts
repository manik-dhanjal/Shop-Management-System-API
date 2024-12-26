import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  constructor(private readonly maxSizeInBytes: number) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    // Validate file type (ensure it is an image)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon', // For .ico files
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types are: ${allowedMimeTypes.join(', ')}.`,
      );
    }

    // Validate file size
    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${this.maxSizeInBytes / 1024 / 1024} MB.`,
      );
    }

    return file;
  }
}
