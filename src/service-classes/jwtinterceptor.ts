import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {catchError, throwError} from 'rxjs';
import {Router} from '@angular/router';

export const JWTInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token:string|null = authService.getToken();

  if (token) {
    if (authService.isTokenExpired()) {
      authService.removeToken()
      router.navigate(['/login']).then();
      return throwError(():string => "Token expired");
    }
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error:HttpErrorResponse)=>{
      if (error.status === 401) {
        authService.removeToken()
        router.navigate(['/login']).then();
      }

      return throwError(():HttpErrorResponse => {return error});
    })
  );

}
