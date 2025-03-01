import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

export class PaymentDetailsDto {
  @ApiProperty({
    description: 'Payment method used for the order',
    enum: PaymentMethod,
    required: true,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status of the order',
    enum: PaymentStatus,
    required: true,
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty({
    description: 'Total amount paid',
    example: 150.75,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  amountPaid: number;

  @ApiPropertyOptional({
    description: 'Transaction ID if payment was made online',
    example: 'TXN987654321',
  })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Any additional payment notes',
    example: 'Paid in two installments',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Date and time of payment',
    example: '2024-03-01T10:30:00.000Z',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Date)
  paymentDate: Date;
}
