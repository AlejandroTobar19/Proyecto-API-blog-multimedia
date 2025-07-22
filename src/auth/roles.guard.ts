import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      console.warn('[RolesGuard] Usuario no tiene "role" definido:', user);
      return false;
    }

    console.log('[RolesGuard] User recibido en request:', user);


    return requiredRoles.includes(user.role); // ✅ corregido

  }
}
