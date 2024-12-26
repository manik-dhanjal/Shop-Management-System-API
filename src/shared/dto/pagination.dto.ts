import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Total count of records that match the given search query',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalRecords: number;

  @ApiProperty({
    description: 'Current page number for the fetched records',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  currentPage: number;

  @ApiProperty({
    description: 'Total number of pages for paginated records',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPages: number;

  @ApiProperty({
    description: 'Next page number after current page',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  @IsOptional()
  nextPage: number | null;

  @ApiProperty({
    description: 'Previous page number after current page',
    type: Number,
  })
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  @IsOptional()
  prevPage: number | null;
}
