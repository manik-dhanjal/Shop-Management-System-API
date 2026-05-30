import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { GstStatus } from '../schema/gst-details.schema';
import { ConstitutionOfBusiness } from '../enum/constitution-of-business.enum';

export class GstDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;

  // Portal-locked fields — optional on input; written only by GstVerificationService
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  legalName?: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  panCardNumber?: string;

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
  registrationDate?: string;

  @IsOptional()
  @IsEnum(GstStatus)
  status?: GstStatus;

  @IsOptional()
  @IsEnum(ConstitutionOfBusiness)
  constitutionOfBusiness?: ConstitutionOfBusiness;

  @IsOptional()
  @IsBoolean()
  einvoiceApplicable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  natureOfBusiness?: string[];

  // Admin-managed portal credentials
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
