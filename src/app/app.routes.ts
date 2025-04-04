import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { Error404Component } from './error_controllers_group/error-404/error-404.component';
import { Error401Component } from './error_controllers_group/error-401/error-401.component';
import { Error400Component } from './error_controllers_group/error-400/error-400.component';
import { SuccessfulRegistrationComponent } from './successful-registration/successful-registration.component';
import { MainUserComponent } from './user_controllers_group/main.user/main.user.component';
import { AdminPanelComponent } from './admin_controllers_group/admin.panel/admin.panel.component';
import { Component } from '@angular/core';
import { UserManagementComponent } from './admin_controllers_group/user-management/user-management.component';

export const routes: Routes = [
  { path: '', component: MainUserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'forbidden', component: Error401Component },
  { path: 'error-data', component: Error400Component },
  {
    path: 'successful-registration',
    component: SuccessfulRegistrationComponent,
  },
  {
    path: 'admin-panel', component: AdminPanelComponent,
    children: [
      { path: 'user-management', component: UserManagementComponent },
    ],
  },
  { path: '**', component: Error404Component },
];
