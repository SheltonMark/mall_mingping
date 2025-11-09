import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard for customer authentication
 * Allows request to proceed even if not authenticated
 */
@Injectable()
export class JwtCustomerOptionalGuard extends AuthGuard('jwt-customer') {
  handleRequest(err, user) {
    // Return user if authenticated, null if not
    // Don't throw error if not authenticated
    return user || null;
  }
}
