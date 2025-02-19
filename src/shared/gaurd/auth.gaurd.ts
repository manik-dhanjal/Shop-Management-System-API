import { UserTokenType } from '@api/user/enum/user-token-type.enum';
import { UserService } from '@api/user/user.service';
import { USER_CONFIG_NAME, UserConfig } from '@config/user.config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@shared/decorator/no-auth.decorator';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException('Bearer access token is missing.');
    }
    try {
      const userConfig = this.configService.get<UserConfig>(USER_CONFIG_NAME);
      const tokenPayload = jwt.verify(
        token,
        userConfig.jwtSecret,
      ) as jwt.JwtPayload;

      if (
        !tokenPayload?.userId ||
        tokenPayload.tokenType !== UserTokenType.ACCESS_TOKEN
      ) {
        throw new Error('Bearer token is not a valid access token');
      }
      const user = await this.userService.getUserById(tokenPayload.userId);
      if (!user) {
        new Error('User doesnt exist for request token');
      }
      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
