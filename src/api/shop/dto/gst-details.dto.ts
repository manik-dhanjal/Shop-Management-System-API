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

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;

  @IsOptional()
  @IsDateString()
  @IsNotEmpty()
  registrationDate?: string;

  @IsOptional()
  @IsEnum(GstStatus)
  @IsNotEmpty()
  status?: GstStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  panCardNumber: string;
}
