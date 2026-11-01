import { Controller, Inject, Get, Post, Patch, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { AdminContentService } from './admin-content.service.js';
@Controller('admin/content')
export class AdminContentController {
constructor(@Inject(AdminContentService) private readonly service: AdminContentService) {}
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
