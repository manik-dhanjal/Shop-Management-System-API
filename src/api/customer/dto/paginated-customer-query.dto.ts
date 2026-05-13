import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginatedCustomerQueryDto extends PaginationQueryDto<CreateCustomerDto> {
  @ApiPropertyOptional({
    description:
      'Fuzzy text search across name, legalName, customerCode, phone, email, gstin, address fields',
    example: 'sharma',
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * When omitted, soft-deleted customers are excluded by default. Pass `true`
   * to include them (e.g. for admin recovery views).
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}
