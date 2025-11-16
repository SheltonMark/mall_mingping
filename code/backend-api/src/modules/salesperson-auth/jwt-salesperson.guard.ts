import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtSalespersonGuard extends AuthGuard('jwt-salesperson') {}
