import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {
  private readonly _baseUrl: string;

  constructor() {
    this._baseUrl = "http://localhost:8080/oauth2/authorization/"
  }

  withGoogle(): void {
    window.location.href = `${this._baseUrl}google`
  }

  withGitHub(): void {
    window.location.href = `${this._baseUrl}github`
  }
}
