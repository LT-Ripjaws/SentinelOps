import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user-role.enum';

// this is a custom decorator to specify required roles for route handlers, used in conjunction with RolesGuard
export const ROLES_KEY = 'roles';

// the Roles decorator takes a list of UserRole values and sets them as metadata on the route handler
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);