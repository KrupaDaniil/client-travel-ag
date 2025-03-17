import { Routes } from '@angular/router';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {RegistrationComponent} from './registration/registration.component';
import {Error404Component} from './error_controllers_group/error-404/error-404.component';
import {Error401Component} from './error_controllers_group/error-401/error-401.component';
import {Error400Component} from './error_controllers_group/error-400/error-400.component';
import {SuccessfulRegistrationComponent} from './successful-registration/successful-registration.component';
import {MainUserComponent} from './user_controllers_group/main.user/main.user.component';

export const routes: Routes = [
  {path: "", component: MainUserComponent},
  {path: "login", component: LoginComponent},
  {path: "registration", component: RegistrationComponent},
  {path: "forbidden", component: Error401Component},
  {path: "error-data", component: Error400Component},
  {path: "successful-registration", component: SuccessfulRegistrationComponent},
  {path: "**", component: Error404Component}
];
