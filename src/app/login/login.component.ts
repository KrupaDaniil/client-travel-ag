import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IUserLogin } from '../../interfaces/user-auth/i-user-login';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatButton, MatFabButton } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardActions,
    MatButton,
    NgOptimizedImage,
    MatFabButton,
  ],
  providers: [UserService, AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private isEmpty: RegExp | undefined;
  loginForm: FormGroup | undefined;
  readonly errorMessage: string[];
  readonly singInOAuth2: string;
  constructor(
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.errorMessage = ['Required field', 'Cannot be empty'];
    this.singInOAuth2 = 'http://localhost:8080/oauth2/authorization/';
  }

  ngOnInit() {
    this.isEmpty = new RegExp('^\\S*$');
    this.loginForm = new FormGroup({
      login: new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.isEmpty)],
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.isEmpty)],
      }),
    });

    if (!this.userService.singInOAuth2()) {
      this.showErrorMessage();
    }
  }

  onSubmit(): void {
    if (this.loginForm && this.loginForm.valid) {
      const _login: string = this.loginForm.get('login')?.value;
      const _password: string = this.loginForm.get('password')?.value;

      const loginData: IUserLogin = {
        username: _login,
        password: _password,
      };

      this.userService.singIn(loginData).subscribe({
        next: (res: boolean): void => {
          if (!res) {
            this.showErrorMessage();
          }
        },
      });
    }
  }

  withGoogle(): void {
    window.location.href = `${this.singInOAuth2}google`;
  }

  withGitHub(): void {
    window.location.href = `${this.singInOAuth2}github`;
  }

  private showErrorMessage(): void {
    if (this.messageService.message() !== null) {
      this.snackBar.open(this.messageService.message() as string, 'close', {
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }
}
