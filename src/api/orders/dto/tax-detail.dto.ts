import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TaxType } from '../enum/tax-type.enum';

export class TaxDetailDto {
  @ApiProperty({
    description: 'Type of tax applied (e.g., CGST, SGST, IGST)',
    example: TaxType.CGST,
    enum: TaxType,
  })
  @IsEnum(TaxType)
  @IsNotEmpty()
  type: TaxType;

  @ApiProperty({
    description: 'Tax rate percentage',
    example: 9.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  rate: number;

  @ApiProperty({
    description: 'Tax amount calculated',
    example: 45.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;
}
