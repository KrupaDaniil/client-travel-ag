import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse,} from '@angular/common/http';
import {IUserReg} from '../interfaces/user-auth/i-user-reg';
import {catchError, map, Observable, of} from 'rxjs';
import {IUserLogin} from '../interfaces/user-auth/i-user-login';
import {IError} from '../interfaces/i-error';
import {AuthService} from './auth.service';
import {JWTResponse} from '../interfaces/user-auth/jwtresponse';
import {ITokenData} from '../interfaces/user-auth/i-token-data';
import {IUserStartData} from '../interfaces/user-auth/i-user-start-data';
import {IUser} from '../interfaces/i-user';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = 'http://localhost:8080';
  }

  registrationUser(user: IUserReg): Observable<boolean | IError> {
    return this.http
      .post(`${this.baseUrl}/registration`, user, { observe: 'response' })
      .pipe(
        map((response) => {
          return response.status === 200;
        }),
        catchError((error: HttpErrorResponse) => {
          const errorBody = error.error?.body;
          const errorObj: IError = {
            status: errorBody?.status || error.status,
            message:
              errorBody?.message ||
              'User with that name or email already exists',
            timestamp: errorBody.timestamp || new Date(),
          };

          return of(errorObj);
        })
      );
  }

  loginUser(user: IUserLogin): Observable<IUserStartData | IError | null> {
    return this.http
      .post<any>(this.baseUrl + '/login', user, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>): IUserStartData | IError | null => {
          if (response.status === 200) {
            const jwtResponse: JWTResponse = {
              token: response.body.body.token,
            };
            this.authService.setToken(jwtResponse.token);
            const data: ITokenData | null = this.authService.getDecodeToken();
            if (data != null) {
              return {
                roles: data.roles,
                username: data.sub,
              };
            }
            return null;
          } else {
            return response.body.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          const errorBody = error.error?.body;
          const errorObj: IError = {
            status: errorBody?.status || error.status,
            message: errorBody?.message || 'Authorization error',
            timestamp: errorBody?.timestamp || new Date(),
          };

          return of(errorObj);
        })
      );
  }

  loadingAllUsers(): Observable<IUser[] | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/all-users`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IUser[] | IError => {
          if (response.status === 200) {
            return response.body as IUser[];
          } else {
            return response.body as IError;
          }
        })
      );
  }

  loadingUserById(id: number): Observable<IUser | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/user/${id}`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IUser | IError => {
          if (response.status === 200) {
            return response.body as IUser;
          } else {
            return response.body as IError;
          }
        })
      );
  }

  loadingUserByEmail(email: string): Observable<IUser | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/user/${email}`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IUser | IError => {
          if (response.status === 200) {
            return response.body as IUser;
          } else {
            return response.body as IError;
          }
        })
      );
  }

  blockUserById(id: number): Observable<boolean | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/block-user/${id}`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): boolean | IError => {
          if (response.status === 200) {
            return true;
          } else {
            return response.body as IError;
          }
        })
      );
  }

  blockUserByEmail(email: string): Observable<boolean | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/block-user/${email}`, {
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<Object>): boolean | IError => {
          if (response.status === 200) {
            return true;
          } else {
            return response.body as IError;
          }
        })
      );
  }

  checkUsername(username: string): Observable<boolean> {
    return this.http
      .get(`${this.baseUrl}/check-username/${username}`, {
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<object>): boolean => {
          return response.status === 200;
        })
      );
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http
      .get(`${this.baseUrl}/check-email/${email}`, { observe: 'response' })
      .pipe(
        map(
          (response: HttpResponse<object>): boolean => response.status === 200
        )
      );
  }
}
