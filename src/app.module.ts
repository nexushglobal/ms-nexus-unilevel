import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { MessagingModule } from './messaging/messaging.module';
import { UnilevelModule } from './unilevel/unilevel.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig,
    }),
    MessagingModule.register(),
    CommonModule,
    UnilevelModule,
  ],
})
export class AppModule {}
