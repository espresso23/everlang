import { Controller, Inject, Post, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SentencesGenerateService } from './sentences-generate.service.js';
@Controller('sentences/generate')
export class SentencesGenerateController {
constructor(@Inject(SentencesGenerateService) private readonly service: SentencesGenerateService) {}
@Post()
@HttpCode(200)

@SetMetadata('admin', true)
post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
