import { OmitType, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { CreateInventoryDto } from './create-inventory.dto';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

export class PaginatedInventoryQueryDto extends OmitType(PaginationQueryDto, [
  'filter',
]) {
  @ValidateNested()
  @Type(() => PartialType(CreateInventoryDto))
  @IsOptional()
  readonly filter?: Partial<CreateInventoryDto>;
}
