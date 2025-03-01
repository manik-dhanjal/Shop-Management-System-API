import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaxDetailDto } from './tax-detail.dto';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '60af8842c4562c001f3b7b50',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Mouse',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Stock Keeping Unit (SKU) of the product',
    example: 'WM-123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'HSN Code for tax compliance',
    example: '84716060',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  hsnCode: string;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Price per unit of the product',
    example: 800.0,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Discount applied to the product (if any)',
    example: 50.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  discount?: number;

  @ApiProperty({
    description: 'Taxable value after applying discount',
    example: 1550.0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  taxableValue: number;

  @ApiProperty({
    description: 'List of applicable taxes on the item',
    type: [TaxDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxDetailDto)
  taxes: TaxDetailDto[];

  @ApiProperty({
    description: 'Total amount after applying discount and taxes',
    example: 418.0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalPrice: number;
}
