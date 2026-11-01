import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { WordSetsService } from './word-sets.service.js';
@Controller('word-sets')
export class WordSetsController {
constructor(@Inject(WordSetsService) private readonly service: WordSetsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
