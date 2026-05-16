import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateShopDto } from '@api/shop/dto/create-shop.dto';

/**
 * Update mutation for the supplier's underlying Shop fields (name, address,
 * GST, contact). Only allowed when the target Shop has
 * `kind === EXTERNAL_SUPPLIER` and the caller's shop matches the original
 * creator — enforced in the service.
 */
export class UpdateSupplierShopDto extends PartialType(
  OmitType(CreateShopDto, ['kind'] as const),
) {}
