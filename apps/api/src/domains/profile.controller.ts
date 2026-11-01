import { Controller, Inject, Get, Put, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { ProfileService } from './profile.service.js';
@Controller('profile')
export class ProfileController {
constructor(@Inject(ProfileService) private readonly service: ProfileService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Put()
@HttpCode(200)


put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
