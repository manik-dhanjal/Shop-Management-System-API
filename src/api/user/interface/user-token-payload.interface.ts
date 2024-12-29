import { UserTokenType } from '../enum/user-token-type.enum';
import { ShopMeta } from '../schema/shop-meta.schema';

export interface UserTokenPayload {
  tokenType: UserTokenType;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  shopsMeta: ShopMeta[];
}
