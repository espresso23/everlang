import { Controller, Inject, Get, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { UserStatsService } from './user-stats.service.js';
@Controller('user/stats')
export class UserStatsController {
constructor(@Inject(UserStatsService) private readonly service: UserStatsService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
}
