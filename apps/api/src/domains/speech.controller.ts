import { Controller, Inject, Get, Post, Delete, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SpeechService } from './speech.service.js';
@Controller('speech')
export class SpeechController {
constructor(@Inject(SpeechService) private readonly service: SpeechService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
@Delete()
@HttpCode(200)


delete(@Req() req: AuthenticatedRequest) {return this.service.delete(req, req.user);}
}
