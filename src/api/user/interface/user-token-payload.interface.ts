import { UserTokenType } from '../enum/user-token-type.enum';

export interface UserTokenPayload {
  tokenType: UserTokenType;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}