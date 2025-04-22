import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { IUserReg } from '../interfaces/user-auth/i-user-reg';
import { catchError, map, Observable, of } from 'rxjs';
import { IUserLogin } from '../interfaces/user-auth/i-user-login';
import { IError } from '../interfaces/i-error';
import { AuthService } from './auth.service';
import { JWTResponse } from '../interfaces/user-auth/jwtresponse';
import { ITokenData } from '../interfaces/user-auth/i-token-data';
import { IUserStartData } from '../interfaces/user-auth/i-user-start-data';
import { IUser } from '../interfaces/i-user';
import { IRole } from '../interfaces/i-role';
import { INewUser } from '../interfaces/i-new-user';
import { INewRole } from '../interfaces/i-new-role';
import { IUserInfo } from '../interfaces/user-auth/i-user-info';
import { IClimateEntity } from '../interfaces/country-block/i-climate.entity';
import { ErrorMessage } from '../models/error-message';

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
              token: response.body.token,
            };
            this.authService.setToken(jwtResponse.token);
            const data: ITokenData | null = this.authService.getDecodeToken();
            if (data != null) {
              return {
                roles: data.roles,
                username: data.sub,
              } as IUserStartData;
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

  loadingAllRoles(): Observable<IRole[] | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/all-roles`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IRole[] | IError => {
          if (response.status === 200) {
            return response.body as IRole[];
          } else {
            return response.body as IError;
          }
        })
      );
  }

  loadingAllClimate(): Observable<IClimateEntity[] | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/api/climates`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IClimateEntity[] | IError => {
          if (response.status === 200) {
            return response.body as IClimateEntity[];
          } else {
            return new ErrorMessage(
              HttpStatusCode.NoContent,
              'The list is empty'
            );
          }
        }),
        catchError((error: HttpErrorResponse) => {
          const errorBody = error.error?.body;
          return of(
            new ErrorMessage(
              errorBody?.status || error.status,
              errorBody?.message || 'Error loading climate data'
            )
          );
        })
      );
  }

  loadingUserById(id: number): Observable<IUser | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/user-get-id/${id}`, { observe: 'response' })
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

  loadingUserByUsername(username: string): Observable<IUserInfo | IError> {
    return this.http
      .get<Object>(`${this.baseUrl}/user-get-username/${username}`, {
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<Object>): IUserInfo | IError => {
          if (response.status === 200) {
            return response.body as IUserInfo;
          } else {
            return response.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const errorObj = error.error?.body;
          const _error: IError = {
            status: errorObj?.status || error.status,
            message: errorObj?.message || 'Error loading user by username',
            timestamp: new Date(),
          };

          return of(_error);
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

  updateUser(user: IUser): Observable<boolean | IError> {
    return this.http
      .post(`${this.baseUrl}/update-user`, user, { observe: 'response' })
      .pipe(
        map((resp: HttpResponse<object>): boolean | IError => {
          if (resp.status === 200) {
            return true;
          } else {
            return resp.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const body = error.error.body;
          const _error: IError = {
            status: body?.status || error.status,
            message: body?.message || 'Error update user data',
            timestamp: body?.timestamp || new Date(),
          };
          return of(_error);
        })
      );
  }

  updateUserInfo(user: IUserInfo): Observable<IUserInfo | IError> {
    return this.http
      .post(`${this.baseUrl}/update-user-info`, user, { observe: 'response' })
      .pipe(
        map((resp: HttpResponse<object>): IUserInfo | IError => {
          if (resp.status === 200) {
            return resp.body as IUserInfo;
          } else {
            return resp.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const body = error.error.body;
          const _error: IError = {
            status: body?.status || error.status,
            message: body?.message || 'Error update user data',
            timestamp: new Date(),
          };
          return of(_error);
        })
      );
  }

  addUser(user: INewUser): Observable<IUser | IError> {
    return this.http
      .post(`${this.baseUrl}/add-user`, user, { observe: 'response' })
      .pipe(
        map((resp: HttpResponse<object>): IUser | IError => {
          if (resp.status === 200) {
            return resp.body as IUser;
          } else {
            return resp.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const body = error.error.body;
          const _error: IError = {
            status: body?.status || error.status,
            message:
              body?.message || "Error when forming a user's addition request",
            timestamp: new Date(),
          };

          return of(_error);
        })
      );
  }

  deleteUser(id: number): Observable<boolean | IError> {
    return this.http
      .delete(`${this.baseUrl}/delete-user/${id}`, { observe: 'response' })
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

  addRole(role: INewRole): Observable<IRole | IError> {
    return this.http
      .post(`${this.baseUrl}/add-role`, role, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): IRole | IError => {
          if (response.status === 200) {
            return response.body as IRole;
          } else {
            return response.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const errorBody = error.error?.body;

          return of({
            status: errorBody?.status || error.status,
            message: 'Data transmission error',
            timestamp: new Date(),
          } as IError);
        })
      );
  }

  deleteRole(id: number): Observable<boolean | IError> {
    return this.http
      .delete(`${this.baseUrl}/delete-role/${id}`, { observe: 'response' })
      .pipe(
        map((response: HttpResponse<Object>): boolean | IError => {
          if (response.status === 200) {
            return true;
          } else {
            return response.body as IError;
          }
        }),
        catchError((error: HttpErrorResponse): Observable<IError> => {
          const errorBody = error.error?.body;

          return of({
            status: errorBody?.status || error.status,
            message: 'Data transmission error',
            timestamp: new Date(),
          } as IError);
        })
      );
  }
}
