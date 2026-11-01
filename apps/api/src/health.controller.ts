import { Controller, Get, SetMetadata } from '@nestjs/common';
import { query } from '@everlang/backend/sql';
import { connectDb } from '@everlang/backend/db';
import { redis } from '@everlang/backend/redis';
@Controller('health') @SetMetadata('public',true)
export class HealthController {
 @Get() live(){return {status:'ok',service:'everlang-api'};}
 @Get('ready') async ready(){await Promise.all([query('SELECT 1'),connectDb(),redis.ping()]);return {status:'ready'};}
}
