import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Pulls the authenticated user (attached by `AuthGuard`) off the request.
 *
 * Usage:
 *   @Post()
 *   create(@CurrentUser() user: UserDocument, @Body() dto: CreateOrderDto) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
