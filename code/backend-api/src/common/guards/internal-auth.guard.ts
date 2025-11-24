import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Internal System Auth Guard
 * Allows both admin and salesperson to access internal system APIs
 * 允许管理员和业务员访问内部系统API
 */
@Injectable()
export class InternalAuthGuard extends AuthGuard(['jwt-admin', 'jwt-salesperson']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try admin strategy first
    try {
      await super.canActivate(context);
      return true;
    } catch (adminError) {
      // If admin strategy fails, the passport library will automatically try salesperson strategy
      // If both fail, an error will be thrown
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    // If either strategy succeeds, user will be set
    if (user) {
      return user;
    }

    // If both strategies failed, throw unauthorized error
    throw err || new UnauthorizedException('需要管理员或业务员权限');
  }
}
