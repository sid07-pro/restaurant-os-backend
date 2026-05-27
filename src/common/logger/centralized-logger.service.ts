// src/common/logger/centralized-logger.service.ts

import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class CentralizedLogger extends ConsoleLogger implements LoggerService {
  log(message: any, context?: string) {
    this.printLog('INFO', message, context, () => super.log(message, context));
  }

  error(message: any, stack?: string, context?: string) {
    this.printLog('ERROR', message, context, () => super.error(message, stack, context), stack);
  }

  warn(message: any, context?: string) {
    this.printLog('WARN', message, context, () => super.warn(message, context));
  }

  debug(message: any, context?: string) {
    this.printLog('DEBUG', message, context, () => super.debug(message, context));
  }

  verbose(message: any, context?: string) {
    this.printLog('VERBOSE', message, context, () => super.verbose(message, context));
  }

  private printLog(level: string, message: any, context?: string, fallbackFn?: () => void, stack?: string) {
    if (process.env.NODE_ENV === 'production') {
      let parsedMsg = message;
      
      if (message instanceof Error) {
        parsedMsg = message.message;
        stack = stack || message.stack;
      } else if (typeof message === 'string') {
        try {
          parsedMsg = JSON.parse(message);
        } catch {
          // not JSON, keep as string
        }
      }
      
      const logObj: any = {
        time: new Date().toISOString(),
        level,
        context: context || 'App',
        message: typeof parsedMsg === 'string' ? parsedMsg : undefined,
      };

      if (typeof parsedMsg === 'object' && parsedMsg !== null) {
        Object.assign(logObj, parsedMsg);
      }

      if (stack) {
        logObj.stack = stack;
      }

      process.stdout.write(JSON.stringify(logObj) + '\n');
    } else {
      fallbackFn?.();
    }
  }
}
