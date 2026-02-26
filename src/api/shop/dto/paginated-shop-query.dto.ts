import { OmitType, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateShopDto } from './create-shop.dto';

export class PaginatedShopQuery extends OmitType(PaginationQueryDto, [
  'filter',
]) {
  @ValidateNested()
  @Type(() => PartialType(CreateShopDto))
  @IsOptional()
  readonly filter?: Partial<CreateShopDto>;
}
