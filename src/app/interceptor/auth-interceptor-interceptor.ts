import {HttpInterceptorFn} from '@angular/common/http';
import { KeycloackService } from '../service/keycloak/keycloak';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloackService);

  return from(keycloakService.getValidToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return next(req);
    })
  );
};
