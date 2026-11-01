import { Controller, Inject, Get, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { ConfigService } from './config.service.js';
@Controller('config')
export class ConfigController {
constructor(@Inject(ConfigService) private readonly service: ConfigService) {}
@Get()
@HttpCode(200)
@SetMetadata('public', true)

get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
