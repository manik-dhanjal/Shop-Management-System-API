import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginatedCustomerQueryDto extends PaginationQueryDto<CreateCustomerDto> {
  @ApiPropertyOptional({
    description:
      'Fuzzy text search across name, phone, email, billingAddress, and shippingAddress fields',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
