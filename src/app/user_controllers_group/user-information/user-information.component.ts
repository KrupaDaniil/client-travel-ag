import {Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {IUserInfo} from '../../../interfaces/user-auth/i-user-info';
import {UserService} from '../../../services/user.service';
import {EntityStorage} from '../../../storage/entity.storage';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-user-information',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatGridList,
    MatGridTile,
    ReactiveFormsModule,
    MatCardActions,
    MatButton
  ],
  providers: [UserService, FormBuilder],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.css'
})
export class UserInformationComponent implements OnInit {
  private store = inject(EntityStorage);
  private userInfo: WritableSignal<IUserInfo | null> = signal<IUserInfo | null>(null);
  private readonly username: Signal<string> = computed(() => this.store.username());
  formData: FormGroup | undefined;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.loadUserInfo();
  }

  ngOnInit(): void {
  }

  private loadUserInfo() {
    effect(() => {
      if (this.userInfo() === null) {
        if (this.username() !== "") {
          this.userService.loadingUserByUsername(this.username()).then((user: IUserInfo | null): void => {
            if (user !== null) {
              this.userInfo.set(user);
              this.addUserData();
            }
          })
        }
      }
    })
  }

  private addUserData(): void {
    this.formData = this.fb.group({
      username: [this.userInfo()?.username],
      email: [this.userInfo()?.email],
      firstName: [this.userInfo()?.firstName],
      lastName: [this.userInfo()?.lastName],
      birthday: [this.userInfo()?.birthday]
    })
  }

  updateUserInfo(): void {
    if (this.formData) {
      const updateUser: IUserInfo = {
        username: this.formData.value.username,
        firstName: this.formData.value.firstName,
        lastName: this.formData.value.lastName,
        email: this.formData.value.email,
        birthday: this.formData.value.birthday
      }

      this.userService.updateUserByUser(updateUser).then((user: IUserInfo | null): void => {
        if (user !== null) {
          this.userInfo.set(user);
        }
      })
    }
  }
}
