import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from './auth.types';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class FakeAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userIdHeader = request.header('x-user-id');
    const workspaceIdHeader = request.header('x-workspace-id');

    if (!userIdHeader || !workspaceIdHeader) {
      throw new UnauthorizedException(
        'Missing required headers: x-user-id and x-workspace-id',
      );
    }

    const user: AuthUser = {
      userId: userIdHeader,
      workspaceId: workspaceIdHeader,
    };
    request.user = user;
    return true;
  }
}
