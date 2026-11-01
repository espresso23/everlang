import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseOptions, initializeOrm } from "@everlang/backend/orm";
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: databaseOptions,
      dataSourceFactory: initializeOrm,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
