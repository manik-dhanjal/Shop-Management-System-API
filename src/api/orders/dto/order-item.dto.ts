import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '60af8842c4562c001f3b7b50',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  product: string;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement for the product',
    example: 'kg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  measuringUnit: string;

  @ApiProperty({
    description: 'Currency in which the order is priced',
    example: 'USD',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Price per unit of the product',
    example: 50.75,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({
    description: 'Discount applied to the product (if any)',
    example: 5.0,
  })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'GST rate applicable on the product',
    example: 18,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  gstRate: number;
}
