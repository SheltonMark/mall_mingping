import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract current customer from JWT token (if authenticated)
 * Returns null if not authenticated or if admin token
 */
export const CurrentCustomer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null; // Returns customer info from JWT or null
  },
);
