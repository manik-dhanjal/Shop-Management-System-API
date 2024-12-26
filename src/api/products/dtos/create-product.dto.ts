import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProductPropertyDto } from './product-property.dto';

export default class CreateProductDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(50)
  sku: string;

  @ArrayMaxSize(50)
  @ArrayMinSize(0)
  @IsArray()
  @IsMongoId({ each: true })
  images: [];

  @IsString()
  @MaxLength(50)
  hsn: string;

  @IsString()
  @MaxLength(100)
  brand: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(100)
  @ArrayMinSize(0)
  keywords: string[];

  @IsArray()
  @IsObject({ each: true })
  @Type(() => ProductPropertyDto)
  @ArrayMaxSize(100)
  @ArrayMinSize(0)
  properties: ProductPropertyDto[];

  @IsNumber()
  igstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @IsNumber()
  cgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @IsNumber()
  sgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%
}
