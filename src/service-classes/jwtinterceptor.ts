import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {catchError, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';

@Injectable()
export class JWTInterceptor implements HttpInterceptor {
  constructor(private authService:AuthService, private router:Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token:string|null = this.authService.getToken();

    if (token) {

      if (this.authService.isTokenExpired()) {
        this.authService.removeToken()
        this.router.navigate(['/login']).then();
        return throwError(():string => "Token expired");
      }
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error:HttpErrorResponse)=>{
        if (error.status === 401) {
          this.authService.removeToken()
          this.router.navigate(['/login']).then();
        }

        return throwError(():HttpErrorResponse => {return error});
      })
    );
  }
}
