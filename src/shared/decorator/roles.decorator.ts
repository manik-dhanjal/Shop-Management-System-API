import { UserRole } from '@api/user/enum/user-role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'user-roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
