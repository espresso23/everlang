import { Controller, Inject, Get, Put, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { DraftsService } from './drafts.service.js';
@Controller('drafts')
export class DraftsController {
constructor(@Inject(DraftsService) private readonly service: DraftsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Put()
@HttpCode(200)


put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
