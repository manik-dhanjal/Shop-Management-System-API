import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDropdownOptionsDto {
  // Define any query parameters or filters for fetching dropdown options if needed
  @ApiProperty({ description: 'Entity type for options', example: 'product' })
  @IsString()
  entityType: string; // e.g., 'product', 'supplier', etc.

  @ApiProperty({
    description: 'Field used as the option value',
    example: '_id',
  })
  @IsString()
  valueField: string; // The field to be used as the value in the dropdown

  @ApiProperty({
    description: 'Field used as the option label',
    example: 'name',
  })
  @IsString()
  labelField: string; // The field to be used as the label in the dropdown

  @ApiProperty({
    description: 'Optional pagination and filter options',
    required: false,
    type: PaginationQueryDto,
  })
  @IsOptional()
  @IsObject()
  @Type(() => PaginationQueryDto)
  query: PaginationQueryDto<Record<string, unknown>>;
}
