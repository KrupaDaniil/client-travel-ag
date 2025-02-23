import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {IUserReg} from '../interfaces/user-auth/i-user-reg';
import {catchError, map, Observable, of} from 'rxjs';
import {IUserLogin} from '../interfaces/user-auth/i-user-login';
import {IError} from '../interfaces/i-error';
import {AuthService} from './auth.service';
import {JWTResponse} from '../interfaces/user-auth/jwtresponse';
import {ITokenData} from '../interfaces/user-auth/i-token-data';
import {IUserStartData} from '../interfaces/user-auth/i-user-start-data';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = "http://localhost:8080";
  }

  registrationUser(user:IUserReg):Observable<boolean | IError> {
    return this.http.post(`${this.baseUrl}/registration`, user, {observe: "response"}).pipe(
      map(response=> response.status === 200),
      catchError((error:HttpErrorResponse)=> {
        const errorBody = error.error?.body;
        const errorObj: IError = {
          status: errorBody?.status || error.status,
          message: errorBody?.message || "User with that name or email already exists",
          timestamp: errorBody.timestamp || new Date()
        }

        return of(errorObj);
      })
    );
  }

  loginUser(user:IUserLogin):Observable<IUserStartData | IError | null> {
    return this.http.post<JWTResponse | IError>(this.baseUrl + "/login", user, {observe: "response"}).pipe(
      map((response: HttpResponse<JWTResponse | IError>) => {
        if (response.status === 200) {
          const jwtResponse: JWTResponse = response.body as JWTResponse;
          this.authService.setToken(jwtResponse.token);
          const data: ITokenData|null = this.authService.getDecodeToken();
          if (data != null) {
            const startUserData: IUserStartData = {
              roles: data.roles,
              username: data.sub
            }

            return startUserData;
          }
          return null;
        } else {
          return response.body as IError;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorBody = error.error?.body;
        const errorObj: IError = {
          status: errorBody?.status || error.status,
          message: errorBody?.message || "Authorization error",
          timestamp: errorBody.timestamp || new Date()
        }

        return of(errorObj);
      })
    );
  }
}
