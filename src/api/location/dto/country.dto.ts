import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty({ example: 'IN' })
  _id: string;

  @ApiProperty({ example: 'IN' })
  code: string;

  @ApiProperty({ example: 'India' })
  name: string;

  @ApiPropertyOptional({ example: '+91' })
  dialCode?: string;

  @ApiPropertyOptional({ example: 'INR' })
  currency?: string;

  @ApiProperty()
  hasStates: boolean;

  @ApiProperty({ description: 'Shows GSTIN field in forms' })
  hasGstin: boolean;

  @ApiPropertyOptional({ example: '^\\d{6}$' })
  pincodeRegex?: string;

  @ApiProperty({ enum: ['GST', 'VAT', 'SALES_TAX', 'NONE'] })
  taxRegime: string;

  @ApiPropertyOptional()
  gstinRegex?: string;

  @ApiPropertyOptional()
  gstinExample?: string;

  @ApiPropertyOptional()
  fiscalYear?: { startMonth: number; startDay: number };
}
