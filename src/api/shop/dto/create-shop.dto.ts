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
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatePhones?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  alternateEmails?: string[];

  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @IsOptional()
  @IsString()
  contactPersonDesignation?: string;

  @ApiPropertyOptional({ type: [ContactPersonDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ContactPersonDto)
  @ValidateNested({ each: true })
  contactPersons?: ContactPersonDto[];
}
