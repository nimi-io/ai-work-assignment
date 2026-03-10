/* eslint-disable @typescript-eslint/no-unsafe-call */
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { ConfigModuleOptions } from '@nestjs/config';

// dotenvConfig({ path: path.resolve(__dirname, '../../../../.env') });

interface DatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  synchronize: boolean;
  logging: boolean;
}

interface RedisConfig {
  url: string;
}

interface GeminiConfig {
  apiKey: string;
  model: string;
}

interface AppConfig {
  port: number;
  app_env: string;
  secretKey: string;
  secretKeyExp: string;
  database: () => DatabaseConfig;
  redis: () => RedisConfig;
  gemini: GeminiConfig;
}

const config = (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  app_env: process.env.ENV ?? 'development',
  secretKey: process.env.SECRET_KEY ?? 'secret',
  secretKeyExp: process.env.SECRET_KEY_EXP ?? '24h',

  database: (): DatabaseConfig => {
    switch (process.env.ENV) {
      case 'staging':
        return {
          type: 'postgres',
          host: process.env.STAGING_DB_HOST ?? '',
          port: parseInt(process.env.STAGING_DB_PORT ?? '5432', 10),
          username: process.env.STAGING_DB_USER ?? '',
          password: process.env.STAGING_DB_PASSWORD ?? '',
          database: process.env.STAGING_DB_NAME ?? '',
          ssl: true,
          synchronize: false,
          logging: false,
        };
      case 'production':
        return {
          type: 'postgres',
          host: process.env.PRODUCTION_DB_HOST ?? '',
          port: parseInt(process.env.PRODUCTION_DB_PORT ?? '5432', 10),
          username: process.env.PRODUCTION_DB_USER ?? '',
          password: process.env.PRODUCTION_DB_PASSWORD ?? '',
          database: process.env.PRODUCTION_DB_NAME ?? '',
          ssl: true,
          synchronize: false,
          logging: true,
        };
      default:
        return {
          type: 'postgres',
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5432', 10),
          username: process.env.DB_USER ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'ts_service_db',
          ssl: false,
          synchronize: true,
          logging: false,
        };
    }
  },

  redis: (): RedisConfig => {
    switch (process.env.ENV) {
      case 'staging':
        return { url: process.env.STAGING_REDIS_URL ?? '' };
      case 'production':
        return { url: process.env.PRODUCTION_REDIS_URL ?? '' };
      default:
        return { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };
    }
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
  },
});

export const configModuleOpts: ConfigModuleOptions = {
  cache: false,
  isGlobal: true,
  envFilePath: '../.env',
  load: [config],
};

export default config;
