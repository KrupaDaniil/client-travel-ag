import {Component, ElementRef, OnInit, Signal, viewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {MessageService} from '../../services/message.service';
import {IUserReg} from '../../interfaces/user-auth/i-user-reg';
import {ValidationService} from '../../services/validation.service';
import {NgOptimizedImage} from '@angular/common';
import {Oauth2Service} from '../../services/oauth2.service';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from '@danielmoncada/angular-datetime-picker';


@Component({
  selector: 'app-registration',
  imports: [FormsModule, ReactiveFormsModule, NgOptimizedImage, OwlDateTimeModule, OwlNativeDateTimeModule],
  providers: [UserService, MessageService, ValidationService],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
  standalone: true
})
export class RegistrationComponent implements OnInit {
  private readonly onlyLetters: RegExp = new RegExp("^([а-яА-ЯіІїЇ]*)\\w*(\\W*)*([а-яА-ЯіІїЇ]*)\\w*$");
  registrationForm: FormGroup | undefined;

  private SHPInput: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>("passInp");
  private SHPImg: Signal<ElementRef<HTMLImageElement> | undefined> =
    viewChild<ElementRef<HTMLImageElement>>("SHImg");

  constructor(private userService: UserService, protected messageService: MessageService,
              private validationService: ValidationService, private oauth2: Oauth2Service) {

  }

  ngOnInit(): void {
    this.registrationForm = new FormGroup({
      username: new FormControl("", {
        validators: [Validators.required, Validators.pattern(this.onlyLetters)],
        asyncValidators: [this.validationService.validationUsername()],
        updateOn: "blur"
      }),
      password: new FormControl("", {validators: [Validators.required, Validators.minLength(6)], updateOn: "blur"}),

      firstName: new FormControl("", {
        validators: [Validators.required, Validators.pattern(this.onlyLetters)],
        updateOn: "blur"
      }),
      lastName: new FormControl("", {
        validators: [Validators.required, Validators.pattern(this.onlyLetters)],
        updateOn: "blur"
      }),

      email: new FormControl("", {
        validators: [Validators.required, Validators.email],
        updateOn: "blur"
      }),
      birthday: new FormControl("")
    })
  }

  onSubmit() {
    if (this.registrationForm && this.registrationForm.valid) {
      const _formData: string[] = [
        this.registrationForm.get("username")?.value,
        this.registrationForm.get("password")?.value,
        this.registrationForm.get("firstName")?.value,
        this.registrationForm.get("lastName")?.value,
        this.registrationForm.get("email")?.value,
      ];

      const _birthday: Date = this.registrationForm.get("birthday")?.value;

      let flag: boolean = false;

      for (const item of _formData) {
        if (this.isBlank(item)) {
          flag = true;
        }
      }

      if (flag) {
        this.messageService.setMessage("Incorrect data were entered. Check the data and try again")
      } else {
        this.messageService.setMessage(null);
        const _registrationData: IUserReg = {
          username: _formData[0],
          password: _formData[1],
          firstName: _formData[2],
          lastName: _formData[3],
          email: _formData[4],
          birthday: _birthday
        }

        this.userService.singUp(_registrationData);
      }
    }
  }

  private isBlank(item: string | undefined | null): boolean {
    if (item === null || item === undefined) {
      return true;
    }

    return /^\s*$/.test(item);
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

  withLogin(): void {
    window.location.href = "/login";
  }

  singUpGoogle(): void {
    this.oauth2.withGoogle();
  }

  singUpGitHub(): void {
    this.oauth2.withGitHub();
  }
}
