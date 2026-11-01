import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SentencesService } from './sentences.service.js';
@Controller('sentences')
export class SentencesController {
constructor(@Inject(SentencesService) private readonly service: SentencesService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
