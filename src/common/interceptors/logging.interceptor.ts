import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CentralizedLogger } from '../logger/centralized-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new CentralizedLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const responseTime = Date.now() - now;
        
        if (process.env.NODE_ENV === 'production') {
          // Structured JSON logging format handled by logger service
          this.logger.log(JSON.stringify({
            method,
            url: originalUrl,
            statusCode,
            responseTime,
            userId,
            ip,
            userAgent
          }));
        } else {
          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${responseTime}ms - IP: ${ip} User: ${userId}`
          );
        }
      }),
    );
  }
}
