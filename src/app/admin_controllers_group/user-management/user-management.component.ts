import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  Signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces/i-user';
import { MessageService } from '../../../services/message.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { IRole } from '../../../interfaces/i-role';

@Component({
  selector: 'app-user-management',
  imports: [FormsModule, ReactiveFormsModule],
  providers: [UserService, MessageService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit, AfterViewChecked {
  private store = inject(EntityStorage);
  private userId: number | undefined;
  private selectUser: IUser | undefined;
  userList: Signal<IUser[]> = computed(() => this.store.usersEntities());
  userRoles: Signal<IRole[]> = computed(() => this.store.rolesEntities());
  errorMessage: Signal<string | null> = computed(() =>
    this.messageService.message()
  );
  addUserForm: FormGroup | undefined;
  editUserForm: FormGroup | undefined;

  @ViewChild('usersBlock') usersBlock?: ElementRef<HTMLTableSectionElement>;
  @ViewChild('editUserModel') editUserModel?: ElementRef<HTMLDialogElement>;
  @ViewChild('editUserBtn') editUserBtn?: ElementRef<HTMLButtonElement>;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private roleService: RoleService,
    private render2: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngAfterViewChecked(): void {
    this.checkTableRow();
    if (this.editUserBtn?.nativeElement) {
      this.render2.listen(this.editUserBtn.nativeElement, 'click', () =>
        this.openEditUserModel()
      );
    }
  }

  ngOnInit(): void {
    this.roleService.setAllRoles();
    this.userService.loadingAllUsers();

    this.createEditUserForm();
  }

  private checkTableRow(): void {
    if (this.usersBlock?.nativeElement) {
      this.render2.listen(
        this.usersBlock.nativeElement,
        'click',
        (e: Event) => {
          const t = e.target as HTMLElement;
          if (t.tagName.toLowerCase() === 'td') {
            const r = t.closest('tr') as HTMLTableRowElement;
            if (r) {
              const radio = r.querySelector(
                'input[type="radio"]'
              ) as HTMLInputElement;
              if (radio) {
                this.render2.setProperty(radio, 'checked', true);
              }

              this.userId = r.dataset['userId'] as unknown as number;

              this.store.usersEntities().filter((user: IUser) => {
                if (user.id === this.userId) {
                  this.selectUser = user;
                }
              });
            }
          }
        }
      );
    }
  }

  private openEditUserModel(): void {
    if (this.editUserModel?.nativeElement) {
      this.editUserModel.nativeElement.showModal();
      this.render2.setStyle(
        this.editUserModel.nativeElement,
        'display',
        'block'
      );
    }
  }

  private createEditUserForm(): void {
    this.editUserForm = new FormGroup({
      id: new FormControl(this.selectUser?.id),
      username: new FormControl(this.selectUser?.username, Validators.required),
      password: new FormControl(''),
      firstName: new FormControl(
        this.selectUser?.firstName,
        Validators.required
      ),
      lastName: new FormControl(this.selectUser?.lastName, Validators.required),
      email: new FormControl(this.selectUser?.email, [
        Validators.required,
        Validators.email,
      ]),
      birthday: new FormControl(this.selectUser?.birthday),
      active: new FormControl(this.selectUser?.active),
      roles: this.createCheckedRole()
    });
  }

  private createCheckedRole(): FormGroup {
    const formGroup = new FormGroup({});
    const userRolesSet = new Set(this.selectUser?.roles.map(role => role.name));// створюємо Set з roleName

    if (this.userRoles) {
      this.userRoles().forEach((role) => {
        console.log('Adding control for role:', role);
        const isSelected = userRolesSet.has(role.name); // перевіряємо, чи є роль користувача
        formGroup.addControl(role.name, new FormControl(isSelected));
      });
    }
    return formGroup;
  }

  onEditUser(): void {
    if (this.editUserForm?.invalid) {
      this.messageService.setMessage('Incorrect data provided');
      return;
    } else {
      this.messageService.setMessage(null);
    }

    const formValue = this.editUserForm?.value;
    const userRoles = Object.entries(formValue.roles)
      .filter(([_, checked]) => checked)
      .map(([name]) =>
        this.store.rolesEntities().find((role) => role.name === name)
      );

    const user: IUser = {
      id: formValue.id,
      username: formValue.username,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      birthday: formValue.birthday,
      active: formValue.active,
      roles: userRoles as IRole[],
    };
  }
}
