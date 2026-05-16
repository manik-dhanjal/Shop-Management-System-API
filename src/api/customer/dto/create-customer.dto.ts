import {
  IsString,
  IsOptional,
  ValidateNested,
  IsMongoId,
  Matches,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from '@shared/dto/location.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType } from '../enum/customer-type.enum';
import { CustomerStatus } from '../enum/customer-status.enum';
import { GstRegistrationType } from '../enum/gst-registration-type.enum';
import { PaymentTerms } from '../enum/payment-terms.enum';
import { CustomerSource } from '../enum/customer-source.enum';

const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export class ContactPersonDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateCustomerDto {
  // -------- IDENTITY --------
  @ApiPropertyOptional({
    description: 'Auto-generated per shop if omitted.',
    example: 'CUST/0042',
  })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'Legal name (matches GSTIN registry; required for Tax Invoice)',
    example: 'JOHN DOE TRADERS PRIVATE LIMITED',
  })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional({ enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  // -------- CONTACT --------
  @ApiProperty({
    description: 'Customer phone number',
    example: '+919876543210',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatePhones?: string[];

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  alternateEmails?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPersonDesignation?: string;

  @ApiPropertyOptional({ type: [ContactPersonDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ContactPersonDto)
  @ValidateNested({ each: true })
  contactPersons?: ContactPersonDto[];

  @ApiPropertyOptional({
    description: 'Profile image ID',
    example: '60af8842c4562c001f3b7b45',
  })
  @IsOptional()
  @IsMongoId()
  profileImage?: string;

  // -------- GST & TAX --------
  @ApiPropertyOptional({ enum: GstRegistrationType })
  @IsOptional()
  @IsEnum(GstRegistrationType)
  gstRegistrationType?: GstRegistrationType;

  @ApiPropertyOptional({
    description: 'GSTIN — required for REGULAR/COMPOSITION/SEZ_*',
    example: '27AAACX1234B1Z1',
  })
  @IsOptional()
  @IsString()
  @Matches(GSTIN_REGEX, { message: 'Invalid GSTIN format' })
  gstin?: string;

  @ApiPropertyOptional({
    description: 'PAN — auto-derived from GSTIN[2..12] when GSTIN is present',
    example: 'AAACX1234B',
  })
  @IsOptional()
  @IsString()
  @Matches(PAN_REGEX, { message: 'Invalid PAN format' })
  pan?: string;

  @ApiPropertyOptional({
    description: '2-digit Indian state code for place of supply',
    example: '27',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}$/, { message: 'State code must be 2 digits' })
  placeOfSupplyStateCode?: string;

  @ApiPropertyOptional({
    description:
      'Default invoice classification (e.g. Tax Invoice, Bill of Supply)',
  })
  @IsOptional()
  @IsString()
  taxInvoicePreference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reverseChargeApplicable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExempt?: boolean;

  // -------- ADDRESSES --------
  @ApiPropertyOptional({
    description: 'Billing address — required for Tax Invoice',
    type: LocationDto,
  })
  @IsOptional()
  @Type(() => LocationDto)
  @ValidateNested()
  billingAddress?: LocationDto;

  @ApiPropertyOptional({ type: [LocationDto] })
  @IsOptional()
  @IsArray()
  @Type(() => LocationDto)
  @ValidateNested({ each: true })
  shippingAddresses?: LocationDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultShippingAddressIndex?: number;

  /** Legacy single shipping address — accepted for backward compatibility. */
  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @Type(() => LocationDto)
  @ValidateNested()
  shippingAddress?: LocationDto;

  // -------- BUSINESS TERMS --------
  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditPeriodDays?: number;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentDefault?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  // -------- CRM --------
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '1990-04-12' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: '2018-06-15' })
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @ApiPropertyOptional({ enum: CustomerSource })
  @IsOptional()
  @IsEnum(CustomerSource)
  source?: CustomerSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  referredByCustomerId?: string;
}
