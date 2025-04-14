import {Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {IUserInfo} from '../../../interfaces/user-auth/i-user-info';
import {UserService} from '../../../services/user.service';
import {EntityStorage} from '../../../storage/entity.storage';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';

@Component({
  selector: 'app-user-information',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatGridList,
    MatGridTile,
    ReactiveFormsModule
  ],
  providers: [UserService, FormBuilder],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.css'
})
export class UserInformationComponent implements OnInit {
  private store = inject(EntityStorage);
  private userInfo: IUserInfo | null;
  private readonly username: Signal<string> = computed(() => this.store.username());
  formData: FormGroup | undefined;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.loadUserInfo();
    this.userInfo = null;
  }

  ngOnInit(): void {
  }

  private loadUserInfo() {
    effect(() => {
      if (this.userInfo === null) {
        if (this.username() !== "") {
          this.userService.loadingUserByUsername(this.username()).then((user: IUserInfo | null): void => {
            if (user !== null) {
              this.userInfo = user;
              this.addUserData();
            }
          })
        }
      }
    })
  }

  private addUserData(): void {
    if (this.userInfo !== null) {
      this.formData = this.fb.group({
        username: [this.userInfo.username],
        email: [this.userInfo.email],
        firstName: [this.userInfo.firstName],
        lastName: [this.userInfo.lastName],
        birthday: [this.userInfo.birthday]
      })
    }
  }
}
