import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {ITokenData} from '../interfaces/user-auth/i-token-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper: JwtHelperService;
  private readonly tokenName: string;

  constructor() {
    this.jwtHelper = new JwtHelperService();
    this.tokenName = "au-token";
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
}
