import { Controller, Get, Post, Body, Query, Req, Res, SetMetadata, HttpCode, Inject } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
import { log, logError } from '@everlang/backend/logger';
import { HttpError } from '@everlang/backend/http';
const password = z.string().min(10).max(128);
const email = z.string().email().max(320);
@SetMetadata('public', true)
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Get('csrf') csrf(@Req() req: Request, @Res({passthrough:true}) res: Response) { return this.auth.csrf(req,res); }
  @Post('sign-in/email') @HttpCode(200)
  async login(@Req() req: Request, @Res({passthrough:true}) res: Response, @Body() raw: unknown) {
    await this.auth.protect(req, 'login');
    const b=z.object({email,password:z.string().min(1).max(128)}).strict().parse(raw);
    return this.auth.login(b.email,b.password,res);
  }
  @Post('sign-up/email') @HttpCode(200)
  async signup(@Req() req: Request, @Body() raw: unknown) {
    await this.auth.protect(req, 'signup');
    const b=z.object({email,password,name:z.string().trim().min(1).max(200)}).strict().parse(raw);
    return this.auth.signup(b.name,b.email,b.password);
  }
  @Post('refresh') @HttpCode(200)
  async refresh(@Req() req: Request, @Res({passthrough:true}) res: Response) { await this.auth.protect(req,'refresh'); return this.auth.refresh(req,res); }
  @Get('me') async me(@Req() req: Request) { const {sid:_sid,...user}=await this.auth.authenticate(req); return {user}; }
  @Post('logout') @HttpCode(200)
  async logout(@Req() req: Request,@Res({passthrough:true}) res: Response) { await this.auth.protect(req); return this.auth.logout(req,res); }
  @Post('logout-all') @HttpCode(200)
  async logoutAll(@Req() req: Request,@Res({passthrough:true}) res: Response) { await this.auth.protect(req); return this.auth.logout(req,res,true); }
  @Get('verify-email')
  async verify(@Query('token') token: string,@Res() res: Response) { await this.auth.verifyEmail(z.string().min(20).max(200).parse(token),res); res.redirect('/'); }
  @Post('request-password-reset') @HttpCode(200)
  async forgot(@Req() req: Request,@Body() raw: unknown) { await this.auth.protect(req,'reset'); const b=z.object({email}).strict().parse(raw); return this.auth.requestReset(b.email); }
  @Post('reset-password') @HttpCode(200)
  async reset(@Req() req: Request,@Body() raw: unknown) { await this.auth.protect(req,'reset'); const b=z.object({token:z.string().min(20).max(200),newPassword:password}).strict().parse(raw); return this.auth.resetPassword(b.token,b.newPassword); }
  @Post('change-password') @HttpCode(200)
  async change(@Req() req: Request,@Body() raw: unknown) { await this.auth.protect(req); const b=z.object({currentPassword:z.string().min(1).max(128),newPassword:password}).strict().parse(raw); return this.auth.changePassword(req,b.currentPassword,b.newPassword); }
  @Post('google/start') @HttpCode(200)
  async google(@Req() req: Request,@Res({passthrough:true}) res: Response,@Body() raw: unknown) {
    await this.auth.protect(req,'google'); const b=z.object({link:z.boolean().default(false),callbackURL:z.string().max(500).default('/')}).strict().parse(raw);
    return this.auth.googleStart(req,res,b.link,b.callbackURL);
  }
  @Get('callback/google')
  async callback(@Req() req: Request,@Query('code') code: string,@Query('state') state: string,@Res() res: Response) {
    try { const target=await this.auth.googleCallback(req,z.string().min(1).max(4096).parse(code),z.string().min(20).max(200).parse(state),res); res.redirect(target); }
    catch(error) { if(error instanceof HttpError&&error.status<500)log('warn','auth.google.callback.failed',{code:error.code,statusCode:error.status});else logError('auth.google.callback.failed',error);res.redirect('/sign-in?error='+(error instanceof HttpError&&error.code==='ACCOUNT_NOT_LINKED'?'account_not_linked':'google_login_failed')); }
  }
}
