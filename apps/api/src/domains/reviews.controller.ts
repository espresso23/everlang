import { Controller, Inject, Post, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { ReviewsService } from './reviews.service.js';
@Controller('reviews')
export class ReviewsController {
constructor(@Inject(ReviewsService) private readonly service: ReviewsService) {}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
