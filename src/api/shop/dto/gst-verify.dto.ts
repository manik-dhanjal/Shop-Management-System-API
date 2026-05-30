import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ConstitutionOfBusiness } from '../enum/constitution-of-business.enum';
import { GstStatus } from '../schema/gst-details.schema';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;
}

export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class NormalizedGstDetailsDto {
  gstin: string;
  legalName?: string;
  tradeName?: string;
  panCardNumber?: string;
  address?: string;
  state?: string;
  registrationDate?: Date;
  status?: GstStatus;
  constitutionOfBusiness?: ConstitutionOfBusiness;
  einvoiceApplicable?: boolean;
  natureOfBusiness?: string[];
  verifiedAt: Date;
}
