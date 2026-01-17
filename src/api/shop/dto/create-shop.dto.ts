import { LocationDto } from '@shared/dto/location.dto';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GstDetailsDto } from './gst-details.dto';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GstDetailsDto)
  gstDetails?: GstDetailsDto;

  @IsArray()
  @IsMongoId({ each: true })
  suppliers: string[];
}
