import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceType } from '../enum/invoice-type.enum';
import { PaymentDetailsDto } from './payment-details.dto';
import { BillingDetailsDto } from './billing-details.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description:
      'Unique Invoice number. Auto-generated server-side if omitted.',
    example: 'INV/25-26/0014',
  })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiProperty({
    description: 'Customer ID',
    example: '60af8842c4562c001f3b7b44',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({
    description: 'Shop ID where the order was placed',
    example: '60af8842c4562c001f3b7b46',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  shop: string;

  @ApiProperty({
    description: 'Type of invoice generated',
    enum: InvoiceType,
    required: true,
  })
  @IsEnum(InvoiceType)
  @IsNotEmpty()
  invoiceType: InvoiceType;

  @ApiProperty({
    description: 'List of order items',
    type: [OrderItemDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Additional order description',
    example: 'Urgent delivery requested',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Billing details including taxes, discounts, and final amount',
    type: BillingDetailsDto,
    required: true,
  })
  @ValidateNested()
  @Type(() => BillingDetailsDto)
  billing: BillingDetailsDto;

  @ApiProperty({
    description: 'Payment details for the order',
    type: PaymentDetailsDto,
    required: true,
  })
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  payment: PaymentDetailsDto;

  @ApiPropertyOptional({
    description: 'Order placement date and time (defaults to now)',
    example: '2024-03-01T10:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  orderDate?: Date;
}
