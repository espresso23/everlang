import { Controller, Inject, Post, Put, Req, HttpCode, SetMetadata } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { TutorService } from './tutor.service.js';
@Controller('tutor')
export class TutorController {
constructor(@Inject(TutorService) private readonly service: TutorService) {}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
@Put()
@HttpCode(200)

@SetMetadata('admin', true)
put(@Req() req: AuthenticatedRequest) {return this.service.put(req, req.user);}
}
