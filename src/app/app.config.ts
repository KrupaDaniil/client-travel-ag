import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {JWTInterceptor} from '../service-classes/jwtinterceptor';
import {provideNativeDateAdapter} from '@angular/material/core';
import {
  OWL_DATE_TIME_FORMATS,
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';


// Визначення власних форматів
export const DT_FORMATS = {
  parseInput: 'DD.MM.YYYY',
  fullPickerInput: 'DD.MM.YYYY',
  datePickerInput: 'DD.MM.YYYY',
  timePickerInput: 'HH:mm',
  monthYearLabel: 'MMM. YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    AuthService,
    provideHttpClient(withInterceptors([JWTInterceptor])),
    provideHttpClient(),
    provideNativeDateAdapter(),
    provideAnimationsAsync(),
    importProvidersFrom(OwlDateTimeModule, OwlNativeDateTimeModule),
    {provide: LOCALE_ID, useValue: 'uk-UA'},
    {provide: OWL_DATE_TIME_FORMATS, useValue: DT_FORMATS}
  ]
};
