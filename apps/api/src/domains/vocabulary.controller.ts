import { Controller, Inject, Get, Post, Put, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { VocabularyService } from './vocabulary.service.js';
@Controller('vocabulary')
export class VocabularyController {
constructor(@Inject(VocabularyService) private readonly service: VocabularyService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
@Put()
@HttpCode(200)


put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
