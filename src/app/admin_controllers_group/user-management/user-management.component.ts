import {Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces/i-user';

@Component({
  selector: 'app-user-management',
  imports: [],
  providers: [UserService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  private store = inject(EntityStorage);
  userList: Signal<IUser[]> = computed(() => this.store.usersEntities());

  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.userService.loadingAllUsers();
  }
}
