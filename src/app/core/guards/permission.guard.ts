import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getUser();

  const requiredPermissions =
    route.data?.['permissions'] ||
    (route.data?.['permission'] ? [route.data?.['permission']] : []);

  const permisos = user?.permisos || [];
  const roles = user?.roles || [];

  const isAdmin =
    roles.includes('ADMINISTRADOR') ||
    roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR');

  const hasPermission = requiredPermissions.some((permission: string) => {
    return (
      permisos.includes(permission) ||
      permisos.some((permiso: any) => permiso?.nombre === permission)
    );
  });

  if (isAdmin || hasPermission) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
