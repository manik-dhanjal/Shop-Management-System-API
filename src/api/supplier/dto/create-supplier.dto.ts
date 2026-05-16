import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierStatus } from '../enum/supplier-status.enum';
import { PaymentTerms } from '@api/customer/enum/payment-terms.enum';
import { CreateShopDto } from '@api/shop/dto/create-shop.dto';
import { LocationDto } from '@shared/dto/location.dto';
import { GstDetailsDto } from '@api/shop/dto/gst-details.dto';

/**
 * Minimal Shop payload used when creating an EXTERNAL_SUPPLIER inline from
 * the supplier-add flow. Subset of CreateShopDto without the kind flag
 * (the supplier service forces kind=EXTERNAL_SUPPLIER).
 */
export class InlineSupplierShopDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => GstDetailsDto)
  gstDetails?: GstDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatePhones?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternateEmails?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPersonName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPersonDesignation?: string;

  @ApiPropertyOptional({ type: () => [Object] })
  @IsOptional()
  @IsArray()
  contactPersons?: CreateShopDto['contactPersons'];
}

export class PrimaryContactDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

/**
 * Create a supplier link on a buying shop. Caller provides exactly ONE of:
 *  - `supplierShopId` — link an existing Shop doc as supplier.
 *  - `newShop` — create a fresh EXTERNAL_SUPPLIER shop AND link it.
 *
 * The remaining fields populate the SupplierLink subdoc.
 */
export class CreateSupplierDto {
  // ---- Discriminator ----
  @ApiPropertyOptional({ description: 'Existing Shop _id to link as supplier.' })
  @IsOptional()
  @IsMongoId()
  supplierShopId?: string;

  @ApiPropertyOptional({ type: InlineSupplierShopDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InlineSupplierShopDto)
  newShop?: InlineSupplierShopDto;

  // ---- Link metadata ----
  @ApiPropertyOptional({ description: 'SUP/NNNN — auto if omitted.' })
  @IsOptional()
  @IsString()
  supplierCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ enum: SupplierStatus })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditPeriodDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDiscountPct?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: PrimaryContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PrimaryContactDto)
  primaryContact?: PrimaryContactDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
