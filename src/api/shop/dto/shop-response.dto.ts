import { LeanDocument } from '@shared/types/lean-document.interface';
import { Shop, ShopDocument } from '../schema/shop.schema';

export function toShopResponse(
  doc: LeanDocument<ShopDocument>,
  myRoles?: string[],
): Omit<Shop, 'suppliers' | 'isDeleted' | 'deletedAt' | '__v'> & {
  myRoles?: string[];
} {
  const { suppliers, isDeleted, deletedAt, ...rest } = doc;
  return { ...rest, myRoles: myRoles || [] };
}
