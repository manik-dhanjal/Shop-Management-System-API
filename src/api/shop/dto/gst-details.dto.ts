import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class GstDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  gstin: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  legalName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  panCardNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;
}
