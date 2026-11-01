import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { GradingProcessor } from "./grading.processor.js";
import { SpeechProcessor } from "./speech.processor.js";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
import { log, logError } from "@everlang/backend/logger";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseOptions, initializeOrm } from "@everlang/backend/orm";
import { redis, getGradingQueue } from "@everlang/backend/redis";
const speech = process.env.WORKER_KIND === "speech";
const url = new URL(process.env.REDIS_URL || "redis://localhost:6379");
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: databaseOptions,
            dataSourceFactory: initializeOrm,
        }),
        BullModule.forRoot({
            connection: {
                host: url.hostname,
                port: Number(url.port || 6379),
                db: Number(url.pathname.slice(1) || 0),
                ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
                ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
                ...(url.protocol === "rediss:" ? { tls: {} } : {}),
                maxRetriesPerRequest: null,
            },
        }),
        BullModule.registerQueue({
            name: speech ? "everlang-speech" : "everlang-grading",
        }),
    ],
    providers: [speech ? SpeechProcessor : GradingProcessor],
})
class WorkerModule {
}
async function main() {
    installProcessErrorHandlers(speech ? "speech-worker" : "grading-worker");
    const app = await NestFactory.createApplicationContext(WorkerModule, {
        logger: false,
        abortOnError: false,
    });
    log("info", "worker.ready", { kind: speech ? "speech" : "grading" });
    let stopping = false;
    for (const signal of ["SIGINT", "SIGTERM"])
        process.on(signal, () => {
            if (stopping)
                return;
            stopping = true;
            const deadline = setTimeout(() => process.exit(1), 150000);
            deadline.unref();
            void (async () => {
                await app.close();
                await getGradingQueue().close();
                await redis.quit();
                clearTimeout(deadline);
                process.exit(0);
            })().catch((e) => {
                logError("worker.shutdown.error", e);
                process.exit(1);
            });
        });
}
void main().catch((e) => {
    logError("worker.startup.error", e);
    process.exit(1);
});
