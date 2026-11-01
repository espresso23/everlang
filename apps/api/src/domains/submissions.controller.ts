import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SubmissionsService } from './submissions.service.js';
@Controller('submissions')
export class SubmissionsController {
constructor(@Inject(SubmissionsService) private readonly service: SubmissionsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
