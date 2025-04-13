import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {ITokenData} from '../interfaces/user-auth/i-token-data';
import {IUserStartData} from '../interfaces/user-auth/i-user-start-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper: JwtHelperService;
  private readonly tokenName: string;

  constructor() {
    this.jwtHelper = new JwtHelperService();
    this.tokenName = "auth-token";
  }

  setToken(token: string):void {
    localStorage.setItem(this.tokenName, token);
  }

  getToken():string | null {
    return localStorage.getItem(this.tokenName);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenName);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getToken() !== undefined;
  }

  isTokenExpired(): boolean {
    const token:string|null = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getDecodeToken(): ITokenData|null {
    const token:string|null = this.getToken();

    if (token != null) {
      return this.jwtHelper.decodeToken(token) as ITokenData;
    } else {
      return null;
    }
  }

  getUserStartData(): IUserStartData | null {
    const currentToken: string | null = this.getToken();

    if (currentToken != null) {
      const decodedToken: ITokenData = this.jwtHelper.decodeToken(currentToken) as ITokenData;
      return {
        roles: decodedToken.roles,
        username: decodedToken.sub
      } as IUserStartData;
    } else {
      return null;
    }
  }
}
