import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {AuthService} from './services/auth.service';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import {JWTInterceptor} from './service-classes/jwtinterceptor';

bootstrapApplication(
  AppComponent,
  appConfig

).catch((err) => console.error(err));
