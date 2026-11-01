import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SpeechAudioService } from './speech-audio.service.js';
@Controller('speech/audio')
export class SpeechAudioController {
constructor(@Inject(SpeechAudioService) private readonly service: SpeechAudioService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
