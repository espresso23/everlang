import { Controller, Inject, Get, Post, Put, Patch, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { ExamsService } from './exams.service.js';
@Controller('exams')
export class ExamsController {
constructor(@Inject(ExamsService) private readonly service: ExamsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
@Patch()
@HttpCode(200)


patch(@Req() req: AuthenticatedRequest) {return this.service.patch(req, req.user);}
@Put()
@HttpCode(200)

@SetMetadata('admin', true)
put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
