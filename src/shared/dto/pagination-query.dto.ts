import { SortDirection } from '@shared/enum/sort-direction.enum';
import { IsInt, IsObject, IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto<T> {
  @IsObject()
  @IsOptional()
  readonly filter?: Partial<T>;

  @IsInt()
  @IsPositive()
  readonly limit: number;

  @IsInt()
  @IsPositive()
  readonly page: number;

  @IsObject()
  @IsOptional()
  readonly sort?: Record<keyof T, SortDirection>;
}
