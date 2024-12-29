import { UserRole } from '@api/user/enum/user-role.enum';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No roles means endpoint is public
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Ensure JWT or session middleware populates `user`
    return roles.includes(user.role);
  }
}
