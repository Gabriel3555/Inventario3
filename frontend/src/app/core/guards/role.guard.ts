import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const rol = auth.rol();
    if (rol && allowedRoles.includes(rol)) return true;
    auth.redirectByRole();
    return false;
  };
}
