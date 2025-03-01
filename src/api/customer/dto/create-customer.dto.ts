import {
  IsString,
  IsOptional,
  ValidateNested,
  IsMongoId,
  Matches,
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

  @ApiPropertyOptional({
    description: 'Address of place where items needs to be shipped',
    type: LocationDto,
  })
  @IsOptional()
  @Type(() => LocationDto)
  @ValidateNested({ each: true })
  shippingAddress?: LocationDto;

  @ApiProperty({
    description:
      'Billing address of the customer, used for invoicing and taxation.',
    type: LocationDto,
    required: true,
  })
  @Type(() => LocationDto)
  @ValidateNested()
  billingAddress: LocationDto;

  @ApiPropertyOptional({
    description:
      'GSTIN (Goods and Services Tax Identification Number) for tax purposes',
    example: '27AAACX1234B1Z1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, {
    message: 'Invalid GSTIN format',
  })
  gstin?: string;
}
