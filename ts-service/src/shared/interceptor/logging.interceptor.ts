import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const path = context.getArgs()[0]?.url;
    const method = context.getArgs()[0]?.method;
    const user = context.getArgs()[0]?.user;
    const controller = context.getClass().name;
    const pattern = context.getHandler().name;
    const data = context.getArgs()[0]?.body;

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        Logger.log(
          `Success => [${method} -- ${path}] => [User -- ${
            user?.id
          } ] => [${controller} => ${pattern}] -- After... ${
            Date.now() - now
          }ms -- Response => [${data}]`,
        );
      }),
      catchError((error) => {
        Logger.error(
          `Error => [${controller} => ${pattern}] ,  ${
            error.message
          } -- After... ${Date.now() - now}ms`,
        );

        return throwError(() => error);
      }),
    );
  }
}
