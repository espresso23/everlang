import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { DictionaryService } from './dictionary.service.js';
@Controller('dictionary')
export class DictionaryController {
constructor(@Inject(DictionaryService) private readonly service: DictionaryService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
