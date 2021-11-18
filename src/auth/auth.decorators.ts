import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { verify } from 'jsonwebtoken';
import defaultTo from 'lodash/defaultTo';
import { Observable } from 'rxjs';
import UserAgent from 'user-agents';

import { Platform as xPlatform } from './auth.interface';
import { UserRoles } from './users/interfaces/user.interface';

export interface IAuthUser {
  hasRole(...roles: UserRoles[]): boolean;
  user_id: number;
  roles: UserRoles[];
  currentRequestRole?: UserRoles;
}

const USER_ROLES_META_DATA = 'RESOLVER_ROLES';
const USER_IS_OPTIONAL = 'USER_IS_OPTIONAL';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    @Inject('ConfigService')
    private readonly configService: ConfigService,
    @Inject('Logger')
    private readonly logger: Logger,
    private reflector: Reflector,
  ) {
    this.logger.setContext(AuthGuard.name);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let request = null;
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    } else {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    }

    const isOptionalAuth = defaultTo(
      this.reflector.get<string[]>(USER_IS_OPTIONAL, context.getHandler()),
      false,
    );
    const accessibleRoles = defaultTo(
      this.reflector.get<string[]>(USER_ROLES_META_DATA, context.getHandler()),
      [],
    );
    const jwtSecret = this.configService.get('app.jwt.secret');
    const requestedRole = request?.headers?.['x-role'];
    const token = defaultTo(request?.headers?.authorization, '').replace(
      'Bearer ',
      '',
    );

    if (isOptionalAuth && !token) {
      Object.assign(request, { user: {} });
      return true;
    }

    try {
      const decodedToken = verify(token, jwtSecret);
      const userRoles: string[] = defaultTo(decodedToken.roles, []);
      // If there are no roles on the controller, means it can be accessed by anyone authenticated
      // then we start off with hasAccess = true by default
      let hasAccess = !accessibleRoles.length;

      // Check if user have enough roles to access this resolver/controller/resource
      userRoles.forEach((role) => {
        // If found any role, keep it true
        hasAccess = hasAccess || accessibleRoles.includes(role);
      });

      // Assign user to request
      Object.assign(request, { user: decodedToken });

      return hasAccess;
    } catch (e) {
      this.logger.error('Error occurred while verifying JWT', e.stack);

      if (isOptionalAuth && !requestedRole) {
        Object.assign(request, { user: {} });
        return true;
      }

      return false;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/tslint/config
export function Auth(...roles: UserRoles[]): any {
  return applyDecorators(
    SetMetadata(USER_ROLES_META_DATA, roles),
    UseGuards(AuthGuard),
  );
}

// eslint-disable-next-line @typescript-eslint/tslint/config
export function AuthOptional(...roles: UserRoles[]): any {
  return applyDecorators(
    SetMetadata(USER_IS_OPTIONAL, true),
    SetMetadata(USER_ROLES_META_DATA, roles),
    UseGuards(AuthGuard),
  );
}

export const AuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);
    const request = context.getContext().req;
    const user = request.user;

    return {
      ...user,
      currentRequestRole: request?.headers['x-role'],
      hasRole(...roles: UserRoles[]) {
        let hasRole = false;

        roles.forEach((role) => {
          // If found any role, keep it true
          hasRole = hasRole || user?.roles?.includes(role);
        });

        return hasRole;
      },
    };
  },
);

export const Platform = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);
    const request = context.getContext().req;
    const userAgent = new UserAgent();
    const platform = request?.headers['x-platform'];

    if (!platform) {
      switch (userAgent?.data?.platform) {
        case 'ios':
          return xPlatform.IOS;
        case 'android':
          return xPlatform.ANDROID;
      }

      switch (userAgent?.data.deviceCategory) {
        case 'desktop':
          return xPlatform.WEB_DESKTOP;
        case 'mobile':
          return xPlatform.WEB_MOBILE;
      }
    }

    return platform;
  },
);
