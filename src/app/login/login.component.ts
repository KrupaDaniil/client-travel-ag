import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  Signal,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import {UserService} from '../../services/user.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {IUserLogin} from '../../interfaces/user-auth/i-user-login';
import {AuthService} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgOptimizedImage} from '@angular/common';
import {ILoginError} from '../../interfaces/i-login-error';
import {IError} from '../../interfaces/i-error';
import {ValidationService} from '../../services/validation.service';
import {Oauth2Service} from '../../services/oauth2.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
  ],
  providers: [UserService, AuthService, MessageService, ValidationService, Oauth2Service],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private isEmpty: RegExp | undefined;
  loginForm: FormGroup | undefined;
  readonly errorMessage: string[];
  protected invalidUsername: WritableSignal<string | null>;
  protected invalidPassword: WritableSignal<string | null>;

  private SHPInput: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>("passInp");
  private SHPImg: Signal<ElementRef<HTMLImageElement> | undefined> =
    viewChild<ElementRef<HTMLImageElement>>("SHImg");


  constructor(private userService: UserService, private messageService: MessageService,
              private check: ValidationService, private oauth2: Oauth2Service, private render: Renderer2) {
    this.errorMessage = ['Required field;', 'Cannot be empty;'];
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

  singInGoogle(): void {
    this.oauth2.withGoogle();
  }

  singInGitHub(): void {
    this.oauth2.withGitHub();
  }

  withRegistration(): void {
    window.location.href = "/registration";
  }

  private showErrorMessage(): void {
    if (this.messageService.message() !== null) {
      this.snackBar.open(this.messageService.message() as string, 'close', {
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }

  protected onSHBtnClick(): void {
    if (this.SHPInput()?.nativeElement?.getAttribute("type") === "password") {
      this.SHPInput()?.nativeElement.setAttribute("type", "text");
      this.SHPImg()?.nativeElement.setAttribute("src", "/icons/password-show-icon.svg");
    } else {
      this.SHPInput()?.nativeElement.setAttribute("type", "password");
      this.SHPImg()?.nativeElement.setAttribute("src", "/icons/password-hide-icon.svg");
    }
  }
}
