// result.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class ResultInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        Sentry.captureException(data);
        return {
          success: true,
          message: 'Success',
          code: 200,
          returnStatus: 'OK',
          data: data,
        };
      }),
    );
  }
}

// global-error.interceptor.ts

import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalErrorInterceptor extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    Logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'ExceptionFilter',
    );

    Sentry.captureException(exception);

    response.status(status).json({
      success: false,
      message,
      code: status,
      returnStatus: 'INTERNAL_SERVER_ERROR',
      data: null,
    });
  }
}
