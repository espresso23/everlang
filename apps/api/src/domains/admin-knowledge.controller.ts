import { Controller, Inject, Get, Post, Patch, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { AdminKnowledgeService } from './admin-knowledge.service.js';
@Controller('admin/knowledge')
export class AdminKnowledgeController {
constructor(@Inject(AdminKnowledgeService) private readonly service: AdminKnowledgeService) {}
@Get()
@HttpCode(200)

@SetMetadata('admin', true)
get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)

@SetMetadata('admin', true)
post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
@Patch()
@HttpCode(200)

@SetMetadata('admin', true)
patch(@Req() req: AuthenticatedRequest) {return this.service.patch(req, req.user);}
}
