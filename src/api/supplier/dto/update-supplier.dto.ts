import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';

/**
 * Patch the link metadata only. The supplier identity (the Shop doc itself)
 * is mutated via the separate `/:supplierId/shop` endpoint, which is why
 * `newShop` and `supplierShopId` are stripped here.
 */
export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['supplierShopId', 'newShop'] as const),
) {}
