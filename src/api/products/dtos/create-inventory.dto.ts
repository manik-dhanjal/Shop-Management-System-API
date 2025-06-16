import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import mongoose, { Types } from 'mongoose';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Purchase price of the inventory item',
    example: 150.75,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  purchasePrice: number;

  @ApiProperty({
    description: 'Selling price of the inventory item',
    example: 150.75,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  sellPrice: number;

  @ApiProperty({
    description: 'Currency of the purchase price',
    example: 'USD',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Supplier ID (Shop reference)',
    example: '64f1a2b3c4d5e6f7890g1234',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    console.log(value);
    return new Object
  })
  @IsMongoId()
  supplier: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'Quantity of the inventory item',
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement for the inventory item',
    example: 'kg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    description: 'Invoice URL for the inventory item',
    example: 'https://example.com/invoice.pdf',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  invoiceUrl: string;
}
