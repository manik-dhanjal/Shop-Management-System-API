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
} from 'class-validator';
import { ShopMeta } from '../schema/shop-meta.schema';
import { ShopMetaDto } from './shop-meta.dto';
import { Type } from 'class-transformer';

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
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be a 10-digit numeric value',
  })
  phone?: number;

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
  @Type(() => ShopMeta)
  shopsMeta?: ShopMetaDto[];
}
