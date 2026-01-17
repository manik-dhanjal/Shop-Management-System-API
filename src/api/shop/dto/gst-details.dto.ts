import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { GstStatus } from '../schema/gst-details.schema';

export class GstDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;

  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsDateString()
  @IsNotEmpty()
  registrationDate: string;

  @IsEnum(GstStatus)
  @IsNotEmpty()
  status: GstStatus;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  panCardNumber: string;
}
