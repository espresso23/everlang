import { Controller, Inject, Post, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { KnowledgeAttemptsService } from './knowledge-attempts.service.js';
@Controller('knowledge/attempts')
export class KnowledgeAttemptsController {
constructor(@Inject(KnowledgeAttemptsService) private readonly service: KnowledgeAttemptsService) {}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
