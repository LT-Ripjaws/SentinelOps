import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { timingSafeEqual } from 'crypto';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../jwt-payload.interface';
import { verifySignedCsrfToken } from '../csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    if (SAFE_METHODS.has(req.method)) return true; // reads can't change state

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || typeof headerToken !== 'string') {
      throw new ForbiddenException('CSRF token missing');
    }

    const a = Buffer.from(cookieToken);
    const b = Buffer.from(headerToken);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('CSRF token mismatch');
    }


    const sid = req.user?.sid;

    if (!sid) {
      throw new ForbiddenException('CSRF session missing');
    }

    const secret = this.configService.getOrThrow<string>('CSRF_SECRET');

    if (!verifySignedCsrfToken(secret, sid, headerToken)) {
      throw new ForbiddenException('CSRF token invalid');
    }
    
    return true;
  }
}