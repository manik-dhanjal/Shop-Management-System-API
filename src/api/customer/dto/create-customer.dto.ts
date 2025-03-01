import {
  IsString,
  IsOptional,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from '@shared/dto/location.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Associated shop ID',
    example: '60af8842c4562c001f3b7b44',
  })
  @IsMongoId()
  shop: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Profile image ID',
    example: '60af8842c4562c001f3b7b45',
  })
  @IsOptional()
  @IsMongoId()
  profileImage?: string;

  @ApiPropertyOptional({ description: 'Customer location' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
