import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ShopMetaDto } from './shop-meta.dto';
import { Type } from 'class-transformer';
import { LocationDto } from '@shared/dto/location.dto';

export class CreateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  // @Matches(/^[0-9]{10}$/, {
  //   message: 'Phone number must be a 10-digit numeric value',
  // })
  phone?: string;

  @ApiPropertyOptional({ description: 'Profile image ID of the user' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Password for the user account' })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @ApiPropertyOptional({
    description: 'collection of shopIDs and user roles for them',
  })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @Type(() => ShopMetaDto)
  shopsMeta?: ShopMetaDto[];

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  location: LocationDto;
}
