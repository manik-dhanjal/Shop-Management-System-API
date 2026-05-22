import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CityDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: '27' })
  stateCode: string;

  @ApiProperty({ example: 'Mumbai' })
  name: string;

  @ApiProperty()
  isMajor: boolean;

  @ApiProperty({ enum: ['city', 'town', 'village', 'metro'] })
  type: string;

  @ApiPropertyOptional()
  population?: number;

  @ApiProperty({ description: 'All pincodes belonging to this city' })
  pincodes: Array<{ code: string; isSezPincode?: boolean; officeType?: string }>;

  @ApiProperty()
  isSez: boolean;

  @ApiPropertyOptional()
  sezName?: string;
}

export class PincodeLookupResultDto {
  @ApiProperty({ example: '400001' })
  pincode: string;

  @ApiProperty({ example: 'Mumbai' })
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  state: string;

  @ApiProperty({ example: '27' })
  stateCode: string;

  @ApiProperty()
  isSez: boolean;

  @ApiPropertyOptional({ enum: ['HO', 'SO', 'BO'] })
  officeType?: string;

  @ApiPropertyOptional()
  sezName?: string;

  @ApiProperty()
  cityId: string;
}

export class CityQueryDto {
  @ApiPropertyOptional({ description: 'Search term for city name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Max results (default 50, max 100)', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
