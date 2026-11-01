import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth/auth.controller.js";
import { AuthService } from "./auth/auth.service.js";
import { JwtGuard } from "./auth/jwt.guard.js";
import { HealthController } from "./health.controller.js";
import { DomainsModule } from "./domains/domains.module.js";
import { validateRuntimeEnvironment } from "./runtime-config.js";
import { DatabaseModule } from "./database.module.js";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      validate: validateRuntimeEnvironment,
    }),
    DatabaseModule,
    DomainsModule,
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtGuard }],
})
export class AppModule {}
