import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const nonAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getUser();
  const roles = user?.roles || [];

  const isAdmin =
    roles.includes('ADMINISTRADOR') ||
    roles.some((rol: any) => rol?.nombre === 'ADMINISTRADOR');

  if (isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
