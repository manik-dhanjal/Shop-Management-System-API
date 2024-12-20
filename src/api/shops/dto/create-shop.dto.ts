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

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsOptional()
  gstin?: string;

  @IsArray()
  @IsMongoId({ each: true })
  suppliers: string[];
}
