import { Controller, Inject, Get, Patch, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { DashboardService } from './dashboard.service.js';
@Controller('dashboard')
export class DashboardController {
constructor(@Inject(DashboardService) private readonly service: DashboardService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Patch()
@HttpCode(200)


patch(@Req() req: AuthenticatedRequest) {return this.service.patch(req, req.user);}
}
