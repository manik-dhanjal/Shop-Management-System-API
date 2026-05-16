import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UpdateSupplierDto } from './update-supplier.dto';

export class PaginatedSupplierQueryDto extends PaginationQueryDto<UpdateSupplierDto> {
  @ApiPropertyOptional({
    description:
      'Fuzzy text search across supplier shop name, GSTIN, alias, code, phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  /** When true, includes soft-deleted supplier links. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}
