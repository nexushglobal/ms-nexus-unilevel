import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string;
  UNILEVEL_DATABASE_URL: string;
  UNILEVEL_HUERTAS_API_URL: string;
  UNILEVEL_HUERTAS_API_KEY: string;
}

const envsSchema = joi
  .object({
    NATS_SERVERS: joi
      .string()
      .default('nats://localhost:4222')
      .description('NATS server URI'),
    PORT: joi.number().port().default(3000),
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .default('development'),
    UNILEVEL_DATABASE_URL: joi
      .string()
      .uri()
      .required()
      .description('Unilevel database connection URI'),
    UNILEVEL_HUERTAS_API_URL: joi
      .string()
      .required()
      .description('URL de la API de Huertas'),
    UNILEVEL_HUERTAS_API_KEY: joi
      .string()
      .required()
      .description('API Key de Huertas'),
  })
  .unknown(true);

const validationResult = envsSchema.validate(process.env);

if (validationResult.error) {
  throw new Error(`Config validation error: ${validationResult.error.message}`);
}

export const envs: EnvVars = validationResult.value as EnvVars;
