import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductPropertyDto } from './product-property.dto';
import { CreateInventoryDto } from '@api/inventory/dto/create-inventory.dto';
import { OmitType } from '@nestjs/swagger';
import { MeasuringUnit } from '../enum/measuring-unit.enum';
import { Currency } from '@shared/enum/currency.enum';

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock: number;

  @IsArray()
  @IsObject({ each: true })
  @Type(() => OmitType(CreateInventoryDto, ['shop', 'product']))
  @ArrayMaxSize(50)
  @ArrayMinSize(0)
  @IsOptional()
  inventory: Omit<CreateInventoryDto, 'shop' | 'product'>[];

  @IsEnum(MeasuringUnit)
  measuringUnit: MeasuringUnit;

  @IsNumber()
  @Min(0)
  price: number; // Price of the product in the specified measuring unit

  @IsEnum(Currency)
  currency: Currency; // Currency of the product price
}
