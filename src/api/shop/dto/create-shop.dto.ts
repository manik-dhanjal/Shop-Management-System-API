import { LocationDto } from '@shared/dto/location.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GstDetailsDto } from './gst-details.dto';
import { ShopKind } from '../enum/shop-kind.enum';
import { ShopStatus } from '../enum/shop-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ContactPersonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(ShopKind)
  kind?: ShopKind;

  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  logo?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GstDetailsDto)
  gstDetails?: GstDetailsDto;

  // ---- Contact (optional; mostly used for EXTERNAL_SUPPLIER shops) ----
  @ApiPropertyOptional({ type: [ContactPersonDto] })
  @IsOptional()
  @IsArray()
  @MinLength(1, { each: true })
  @Type(() => ContactPersonDto)
  @ValidateNested({ each: true })
  contactPersons?: ContactPersonDto[];
}
