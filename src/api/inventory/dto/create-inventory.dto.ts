import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import mongoose, { Types } from 'mongoose';
import { MeasuringUnit } from '@api/products/enum/measuring-unit.enum';

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
  @IsNotEmpty()
  @IsMongoId()
  supplier: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'Initial Quantity of the inventory item',
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  initialQuantity: number;

  @ApiProperty({
    description: 'Current Quantity of the inventory item',
    example: 100,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  currentQuantity: number;

  @ApiProperty({
    description: 'Invoice URL for the inventory item',
    example: 'https://example.com/invoice.pdf',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  invoiceUrl: string;

  @ApiProperty({
    description: 'Date when the inventory item was purchased',
    example: '2023-10-01T00:00:00.000Z',
    required: true,
  })
  @Type(() => Date)
  @IsNotEmpty()
  purchasedAt: Date;

  @ApiProperty({
    description: 'shop ID the inventory item is associated with',
    example: '64f1a2b3c4d5e6f7890g1234',
    required: true,
  })
  @IsNotEmpty()
  @IsMongoId()
  shop: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'product ID the inventory item is associated with',
    example: '64f1a2b3c4d5e6f7890g1234',
    required: true,
  })
  @IsMongoId()
  product: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'Measuring unit for the inventory item',
    example: 'kg',
    required: true,
  })
  @IsEnum(MeasuringUnit)
  @IsNotEmpty()
  measuringUnit: MeasuringUnit;
}
