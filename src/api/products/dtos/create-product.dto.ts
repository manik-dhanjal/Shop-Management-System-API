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
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { MeasuringUnit } from '../enum/measuring-unit.enum';
import { Currency } from '@shared/enum/currency.enum';

export default class CreateProductDto {
  @ApiProperty({ description: 'Name of the product', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Optional detailed description',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Stock keeping unit identifier', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'List of image ids',
    type: [String],
    required: false,
  })
  @ArrayMaxSize(50)
  @ArrayMinSize(0)
  @IsArray()
  @IsMongoId({ each: true })
  images: [];

  @ApiProperty({ description: 'HSN code', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  hsn: string;

  @ApiProperty({ description: 'Brand name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({
    description: 'Search keywords',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(100)
  @ArrayMinSize(0)
  keywords: string[];

  @ApiProperty({
    description: 'Custom properties',
    type: [ProductPropertyDto],
    required: false,
  })
  @IsArray()
  @IsObject({ each: true })
  @Type(() => ProductPropertyDto)
  @ArrayMaxSize(100)
  @ArrayMinSize(0)
  properties: ProductPropertyDto[];

  @ApiProperty({ description: 'Applicable IGST rate', example: 18 })
  @IsNumber()
  igstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @ApiProperty({ description: 'Applicable CGST rate', example: 9 })
  @IsNumber()
  cgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @ApiProperty({ description: 'Applicable SGST rate', example: 9 })
  @IsNumber()
  sgstRate: number; //Applicable IGST rate, e.g., 5%, 12%, 18%, 28%

  @ApiProperty({
    description: 'Initial stock quantity',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock: number;

  @ApiProperty({
    description: 'Related inventory entries',
    type: [OmitType(CreateInventoryDto, ['shop', 'product'])],
    required: false,
  })
  @IsArray()
  @IsObject({ each: true })
  @Type(() => OmitType(CreateInventoryDto, ['shop', 'product']))
  @ArrayMaxSize(50)
  @ArrayMinSize(0)
  @IsOptional()
  inventory: Omit<CreateInventoryDto, 'shop' | 'product'>[];

  @ApiProperty({ description: 'Unit of measurement', enum: MeasuringUnit })
  @IsEnum(MeasuringUnit)
  measuringUnit: MeasuringUnit;

  @ApiProperty({ description: 'Price per unit', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number; // Price of the product in the specified measuring unit

  @ApiProperty({
    description: 'Currency of the product price',
    example: 'USD',
    required: true,
    enum: Currency,
  })
  @IsEnum(Currency)
  currency: Currency; // Currency of the product price
}
