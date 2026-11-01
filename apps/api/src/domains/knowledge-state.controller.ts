import { Controller, Inject, Get, Put, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { KnowledgeStateService } from './knowledge-state.service.js';
@Controller('knowledge/state')
export class KnowledgeStateController {
constructor(@Inject(KnowledgeStateService) private readonly service: KnowledgeStateService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Put()
@HttpCode(200)


put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
