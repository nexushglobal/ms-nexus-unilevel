import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { envs } from './envs';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: envs.UNILEVEL_DATABASE_URL,
  autoLoadEntities: true,
  // synchronize: envs.environment !== 'production',
  synchronize: true,
};
