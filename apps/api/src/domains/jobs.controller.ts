import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { JobsService } from './jobs.service.js';
@Controller('jobs')
export class JobsController {
constructor(@Inject(JobsService) private readonly service: JobsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
