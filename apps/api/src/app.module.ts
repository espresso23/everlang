import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { JwtGuard } from './auth/jwt.guard.js';
import { HealthController } from './health.controller.js';
import { DomainsModule } from './domains/domains.module.js';
@Module({imports:[ConfigModule.forRoot({isGlobal:true,ignoreEnvFile:true,validate:(env)=>{for(const name of ['DATABASE_URL','MONGODB_URI','REDIS_URL','JWT_PRIVATE_KEY_B64','JWT_PUBLIC_KEY_B64','CSRF_SECRET'])if(!env[name])throw new Error(name+' must be configured');new URL(env.PUBLIC_ORIGIN||'http://localhost:3000');return env;}}),DomainsModule],controllers:[AuthController,HealthController],providers:[AuthService,{provide:APP_GUARD,useClass:JwtGuard}]})
export class AppModule {}
