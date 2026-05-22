import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'Second address line', example: 'Suite 4B' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'Country name', example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'State name', example: 'Maharashtra' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ description: '2-digit GST state code', example: '27' })
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiProperty({ description: 'City name', example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '400001' })
  @IsString()
  @IsNotEmpty()
  pinCode: string;

  // ObjectId refs — optional; null when user typed an unknown place
  @ApiPropertyOptional({ description: 'ObjectId ref → countries collection' })
  @IsOptional()
  @IsString()
  countryRef?: string;

  @ApiPropertyOptional({ description: 'ObjectId ref → states collection' })
  @IsOptional()
  @IsString()
  stateRef?: string;

  @ApiPropertyOptional({ description: 'ObjectId ref → cities collection' })
  @IsOptional()
  @IsString()
  cityRef?: string;
}
