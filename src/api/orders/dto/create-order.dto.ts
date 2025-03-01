import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderPaymentStatus } from '../enum/order-payment-status.order';
import { OrderItemDto } from './order-item.dto';
import { LocationDto } from '@shared/dto/location.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Unique order number',
    example: 'ORD123456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({
    description: 'Customer ID',
    example: '60af8842c4562c001f3b7b44',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({
    description: 'ID of the person who billed the order',
    example: '60af8842c4562c001f3b7b45',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  billedBy: string;

  @ApiProperty({
    description: 'Shop ID where the order was placed',
    example: '60af8842c4562c001f3b7b46',
    required: true,
  })
  @IsMongoId()
  @IsNotEmpty()
  shop: string;

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

  @ApiPropertyOptional({
    description: 'Place of supply details',
    type: LocationDto,
  })
  @IsOptional()
  @Type(() => LocationDto)
  @ValidateNested({ each: true })
  placeOfSupply?: LocationDto;

  @ApiProperty({
    description: 'Total GST amount for the order',
    example: 18.5,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  gstTotal: number;

  @ApiProperty({
    description: 'Total payable amount',
    example: 150.75,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({
    description: 'Payment method used',
    example: 'Credit Card',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment status of the order',
    enum: OrderPaymentStatus,
    required: true,
  })
  @IsEnum(OrderPaymentStatus)
  @IsNotEmpty()
  paymentStatus: OrderPaymentStatus;

  @ApiPropertyOptional({
    description: 'Transaction ID if payment was made online',
    example: 'TXN987654321',
  })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({
    description: 'Order placement date and time',
    example: '2024-03-01T10:30:00.000Z',
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt?: Date;
}
