import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';
import { PaginationMetadataDto } from './pagination.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of documents returned in the search results',
  })
  @IsArray()
  readonly docs!: T[];

  @ApiProperty({
    description: 'Pagination metadata for the returned search results',
    type: PaginationMetadataDto,
  })
  @IsObject()
  readonly pagination!: PaginationMetadataDto;
}
