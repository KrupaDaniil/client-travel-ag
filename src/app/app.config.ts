import {ApplicationConfig, inject, Injector, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {JWTInterceptor} from '../service-classes/jwtinterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    AuthService,
    provideHttpClient(withInterceptors([JWTInterceptor])),
    provideHttpClient()
  ]
};
