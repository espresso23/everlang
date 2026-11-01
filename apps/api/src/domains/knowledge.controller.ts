import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { KnowledgeService } from './knowledge.service.js';
@Controller('knowledge')
export class KnowledgeController {
constructor(@Inject(KnowledgeService) private readonly service: KnowledgeService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
