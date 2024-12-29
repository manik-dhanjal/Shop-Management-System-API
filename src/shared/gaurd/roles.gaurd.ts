import { UserRole } from '@api/user/enum/user-role.enum';
import { ShopMeta } from '@api/user/schema/shop-meta.schema';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@shared/decorator/roles.decorator';
import { User } from '@api/user/schema/user.schema';
import { Request } from 'express';
import { ShopDocument } from '@api/shop/schema/shop.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log(requiredRoles);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const shopId = request.params.shopId;
    const user = request['user'] as User;

    if (!user || !shopId) {
      throw new NotFoundException('User or shopId not found');
    }

    const shopExists = user.shopsMeta.find(
      (shopMeta: ShopMeta) =>
        (shopMeta.shop as ShopDocument)._id.toString() === shopId,
    );

    if (!shopExists) {
      throw new NotFoundException(
        `Shop with ID ${shopId} does not exist for this user`,
      );
    }

    return requiredRoles.some((role) => shopExists.roles?.includes(role));
  }
}
