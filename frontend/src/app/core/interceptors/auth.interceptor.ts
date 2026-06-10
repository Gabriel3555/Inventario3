import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAuthorizationHeader();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: token } });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Sesión expirada o token inválido: cerrar sesión y volver al login.
      // Se excluyen las llamadas de auth (un login fallido no debe desloguear).
      if (err.status === 401 && !req.url.includes('/auth/') && auth.isLoggedIn()) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
