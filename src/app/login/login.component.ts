import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {IUserLogin} from '../../interfaces/user-auth/i-user-login';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle,} from '@angular/material/card';
import {MatButton, MatFabButton} from '@angular/material/button';
import {AuthService} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgOptimizedImage} from '@angular/common';
import {ILoginError} from '../../interfaces/i-login-error';
import {IError} from '../../interfaces/i-error';
import {ValidationService} from '../../services/validation.service';

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
  providers: [UserService, AuthService, MessageService, ValidationService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private isEmpty: RegExp | undefined;
  loginForm: FormGroup | undefined;
  readonly errorMessage: string[];
  readonly singInOAuth2: string;
  protected invalidUsername: WritableSignal<string | null>;
  protected invalidPassword: WritableSignal<string | null>;


  constructor(private userService: UserService, private messageService: MessageService,
              private check: ValidationService) {
    this.errorMessage = ['Required field;', 'Cannot be empty;'];
    this.singInOAuth2 = 'http://localhost:8080/oauth2/authorization/';
    this.invalidUsername = signal<string | null>(null);
    this.invalidPassword = signal<string | null>(null);
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
        next: (res: void | ILoginError | IError): void => {
          if (this.check.isError(res)) {
            this.messageService.setMessage((res as IError).message);
            this.showErrorMessage();
          }

          if (this.check.isLoginError(res)) {
            const loginError: ILoginError = res as ILoginError;

            if (loginError.usernameError) {
              this.invalidUsername.set(loginError.usernameError + ";");
              setTimeout(() => {
                this.invalidUsername.set(null);
              }, 5000)
            } else {
              this.invalidUsername.set(null);
            }

            if (loginError.passwordError) {
              this.invalidPassword.set(loginError.passwordError + ";");
              setTimeout(() => {
                this.invalidPassword.set(null);
              }, 5000)
            } else {
              this.invalidPassword.set(null);
            }
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

  protected readonly setTimeout = setTimeout;
}
