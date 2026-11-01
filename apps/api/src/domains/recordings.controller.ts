import { Controller, Inject, Get, Post, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { RecordingsService } from './recordings.service.js';
@Controller('recordings')
export class RecordingsController {
constructor(@Inject(RecordingsService) private readonly service: RecordingsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
