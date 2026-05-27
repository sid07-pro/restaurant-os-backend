// src/common/config/env.config.ts

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
  CORS_ORIGINS: Joi.string().default('*'),
  RATE_LIMIT_GLOBAL_TTL: Joi.number().default(60000),
  RATE_LIMIT_GLOBAL_LIMIT: Joi.number().default(100),
  RATE_LIMIT_AUTH_TTL: Joi.number().default(60000),
  RATE_LIMIT_AUTH_LIMIT: Joi.number().default(5),
  RATE_LIMIT_WS_TTL: Joi.number().default(60000),
  RATE_LIMIT_WS_LIMIT: Joi.number().default(10),
});
export type EnvConfig = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;
  CORS_ORIGINS: string;
  RATE_LIMIT_GLOBAL_TTL: number;
  RATE_LIMIT_GLOBAL_LIMIT: number;
  RATE_LIMIT_AUTH_TTL: number;
  RATE_LIMIT_AUTH_LIMIT: number;
  RATE_LIMIT_WS_TTL: number;
  RATE_LIMIT_WS_LIMIT: number;
};
