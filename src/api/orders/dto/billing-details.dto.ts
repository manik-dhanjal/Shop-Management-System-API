import { IsArray, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaxDetailDto } from './tax-detail.dto';

export class BillingDetailsDto {
  @ApiProperty({
    description: 'Subtotal before any discounts',
    example: 3000.0,
  })
  @IsNumber()
  @IsPositive()
  subTotal: number;

  @ApiProperty({ description: 'Total discounts applied', example: 100.0 })
  @IsNumber()
  @IsPositive()
  discounts: number;

  @ApiProperty({
    description: 'List of applicable taxes on the item',
    type: [TaxDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxDetailDto)
  taxes: TaxDetailDto[];

  @ApiProperty({
    description: 'Grand total before rounding off',
    example: 3161.5,
  })
  @IsNumber()
  @IsPositive()
  grandTotal: number;

  @ApiProperty({ description: 'Round-off adjustment', example: 0.5 })
  @IsNumber()
  @IsPositive()
  roundOff: number;

  @ApiProperty({
    description: 'Final payable amount after round-off',
    example: 3161.0,
  })
  @IsNumber()
  @IsPositive()
  finalAmount: number;
}
