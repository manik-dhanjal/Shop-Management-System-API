import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { GstReturnType } from '../schema/gst-filing.schema';

export class PrepareGstReturnDto {
  @ApiProperty({
    description: 'GSTIN of the taxpayer (15-character alphanumeric)',
    example: '29ABCDE1234F1Z5',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
  gstin: string;

  @ApiProperty({
    description: 'GST return period in MMYYYY format',
    example: '032024',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\d{4}$/)
  returnPeriod: string;

  @ApiProperty({
    description: 'Type of GST return to prepare',
    enum: GstReturnType,
    example: GstReturnType.GSTR1,
  })
  @IsEnum(GstReturnType)
  @IsNotEmpty()
  returnType: GstReturnType;

  @ApiPropertyOptional({
    description: 'Use AI to enhance and validate prepared return data',
    example: true,
  })
  @IsOptional()
  useAi?: boolean;
}
