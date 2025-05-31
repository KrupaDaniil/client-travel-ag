import {Component} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Oauth2Service} from '../../../services/oauth2.service';

@Component({
  selector: 'app-login-start',
  imports: [
    NgOptimizedImage
  ],
  providers: [Oauth2Service],
  templateUrl: './login-start.component.html',
  styleUrl: './login-start.component.css'
})
export class LoginStartComponent {
  constructor(private oauth2: Oauth2Service) {
  }

  loginInGoogle(): void {
    this.oauth2.withGoogle();
  }

  loginInGitHub(): void {
    this.oauth2.withGitHub();
  }

  withLogin(): void {
    window.location.href = "/login";
  }

  withRegistration(): void {
    window.location.href = "/registration";
  }
}
