import { Controller, Inject, Get, Post, Req, HttpCode } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/jwt.guard.js';
import { UserFavoritesService } from './user-favorites.service.js';
@Controller('user/favorites')
export class UserFavoritesController {
constructor(@Inject(UserFavoritesService) private readonly service: UserFavoritesService) {}
@Get()
@HttpCode(200)


get(@Req() req: AuthenticatedRequest) {return this.service.get(req, req.user);}
@Post()
@HttpCode(200)


post(@Req() req: AuthenticatedRequest) {return this.service.post(req, req.user);}
}
