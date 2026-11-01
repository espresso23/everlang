import { Controller, Inject, Post, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { SubmissionsGradeService } from './submissions-grade.service.js';
@Controller('submissions/grade')
export class SubmissionsGradeController {
constructor(@Inject(SubmissionsGradeService) private readonly service: SubmissionsGradeService) {}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
