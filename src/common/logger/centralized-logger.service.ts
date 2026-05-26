// src/common/logger/centralized-logger.service.ts

import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class CentralizedLogger extends ConsoleLogger implements LoggerService {
  log(message: any, context?: string) {
    const formatted = this.formatJsonMessage('INFO', message, context);
    super.log(formatted);
  }

  error(message: any, stack?: string, context?: string) {
    const formatted = this.formatJsonMessage('ERROR', message, context);
    super.error(formatted, stack);
  }

  warn(message: any, context?: string) {
    const formatted = this.formatJsonMessage('WARN', message, context);
    super.warn(formatted);
  }

  debug(message: any, context?: string) {
    const formatted = this.formatJsonMessage('DEBUG', message, context);
    super.debug(formatted);
  }

  verbose(message: any, context?: string) {
    const formatted = this.formatJsonMessage('VERBOSE', message, context);
    super.verbose(formatted);
  }

  private formatJsonMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    return `{"time":"${timestamp}","level":"${level}","context":"${context || 'App'}","message":"${msg}"}`;
  }
}
