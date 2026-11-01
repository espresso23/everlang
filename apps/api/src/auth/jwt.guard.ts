import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Viewer } from '@everlang/backend/http';
import { HttpError } from '@everlang/backend/http';
import { AuthService } from './auth.service.js';
export type AuthenticatedRequest = Request & { user: Viewer & { sid: string } };
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector, @Inject(AuthService) private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()])) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    req.user = await this.auth.authenticate(req);
    if (!req.user.emailVerified) throw new HttpError(403, 'Hãy xác minh email để tiếp tục.', 'EMAIL_NOT_VERIFIED');
    if (this.reflector.getAllAndOverride<boolean>('admin', [context.getHandler(), context.getClass()]) && !req.user.admin) throw new HttpError(403, 'Chỉ quản trị viên được phép thực hiện.', 'FORBIDDEN');
    if (!['GET', 'HEAD'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin && origin !== (process.env.PUBLIC_ORIGIN || 'http://localhost:3000')) throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.', 'INVALID_ORIGIN');
      if (!req.is('application/json')) throw new HttpError(415, 'Yêu cầu JSON.', 'JSON_REQUIRED');
    }
    return true;
  }
}
