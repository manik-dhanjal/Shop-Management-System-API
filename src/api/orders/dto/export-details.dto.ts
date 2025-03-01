import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ExportDetailsDto {
  @ApiProperty({
    description: 'Indicates if the order is an export',
    example: true,
  })
  @IsOptional()
  @IsNotEmpty()
  isExport: boolean;

  @ApiPropertyOptional({
    description: 'Currency for export transaction',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Exchange rate for conversion',
    example: 82.5,
  })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiPropertyOptional({
    description: 'Shipping Bill Number',
    example: 'SB12345',
  })
  @IsString()
  @IsOptional()
  shippingBillNumber?: string;

  @ApiPropertyOptional({
    description: 'Shipping Bill Date',
    example: '2024-03-05T10:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  shippingBillDate?: Date;
}
