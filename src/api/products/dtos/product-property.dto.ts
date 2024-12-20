import { IsString, MaxLength, MinLength } from 'class-validator';

export class ProductPropertyDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string;

  @IsString()
  @MaxLength(100)
  @MinLength(1)
  value: string;
}
