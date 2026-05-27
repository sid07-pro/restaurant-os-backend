// src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CentralizedLogger } from '../logger/centralized-logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new CentralizedLogger('ExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
        : exceptionResponse;

    const isProduction = process.env.NODE_ENV === 'production';
    const safeMessage = isProduction && httpStatus === HttpStatus.INTERNAL_SERVER_ERROR 
      ? 'Internal server error' 
      : message;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: safeMessage,
      // Only include stack trace if not in production
      ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
    };

    // Structured pino-style JSON logging
    this.logger.error(
      `Exception thrown at ${responseBody.path}: ${
        exception instanceof Error ? exception.message : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
