import { databaseReady } from "@everlang/backend/orm";

import { Controller, Get, SetMetadata } from "@nestjs/common";
import { connectDb } from "@everlang/backend/db";
import { redis } from "@everlang/backend/redis";
@Controller("health")
@SetMetadata("public", true)
export class HealthController {
  @Get() live() {
    return { status: "ok", service: "everlang-api" };
  }
  @Get("ready") async ready() {
    await Promise.all([databaseReady(), connectDb()]);
    const queueAvailable = ["ready", "wait"].includes(redis.status) && await redis.ping().then(
      () => true,
      () => false,
    );
    return { status: queueAvailable ? "ready" : "degraded", queueAvailable };
  }
}
