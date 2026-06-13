import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../jwt-payload.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/user-role.enum';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get the required roles from the route handler's metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // if no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // get the user from the request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    
    const user = request.user;

    // if there's no user, deny access
     if (!user) {
      return false;
    }

    // check if the user's role is in the list of required roles, allow access if it is
    return requiredRoles.includes(user.role);
    }   
}