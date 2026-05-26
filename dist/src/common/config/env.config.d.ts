import * as Joi from 'joi';
export declare const envValidationSchema: Joi.ObjectSchema<any>;
export type EnvConfig = {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES: string;
    CORS_ORIGINS: string;
};
