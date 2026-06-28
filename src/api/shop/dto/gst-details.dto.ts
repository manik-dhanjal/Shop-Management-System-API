import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class GstDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;

  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 15)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  panCardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;
}
