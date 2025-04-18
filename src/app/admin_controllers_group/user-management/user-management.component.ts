import {
  AfterViewChecked, Component, computed, effect, ElementRef, inject,
  OnInit, Renderer2, signal, Signal, ViewChild, WritableSignal
} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces/i-user';
import { MessageService } from '../../../services/message.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../services/role.service';
import { IRole } from '../../../interfaces/i-role';
import {NgIf} from '@angular/common';
import {INewUser} from '../../../interfaces/i-new-user';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';

@Component({
  selector: 'app-user-management',
  imports: [FormsModule, ReactiveFormsModule, NgIf, MatSidenavContainer, MatSidenavContent, MatSidenav],
  providers: [UserService, MessageService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit, AfterViewChecked {
  private store = inject(EntityStorage);
  private userId: number | undefined;
  private selectUser: IUser | undefined;
  private readonly defaultRole: string;
  private initAddForm: boolean;
  private isSelectedRow: boolean;
  private searchList: IUser[] | undefined;
  userList: Signal<IUser[]> = computed(() => this.store.usersEntities());
  userRoles: Signal<IRole[]> = computed(() => this.store.rolesEntities());
  errorMessage: Signal<string | null> = computed(() => this.messageService.message());
  displayContent: WritableSignal<IUser[] | null> = signal<IUser[] | null>(null);
  addUserForm: FormGroup | undefined;
  editUserForm: FormGroup | undefined;
  searchDataForm: FormGroup | undefined;

  @ViewChild('usersBlock') usersBlock?: ElementRef<HTMLTableSectionElement>;
  @ViewChild("addUserBtn") addUserBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("addUserModal") addUserModal?: ElementRef<HTMLDialogElement>;
  @ViewChild("addModelBtnClose") addModelBtnClose?: ElementRef<HTMLButtonElement>;
  @ViewChild("editUserModal") editUserModel?: ElementRef<HTMLDialogElement>;
  @ViewChild("editUserBtn") editUserBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("editModalBtnClose") editModalBtnClose?: ElementRef<HTMLButtonElement>;
  @ViewChild("RemoveUserBtn") removeUserBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("sidenav") sidenav?: MatSidenav;
  @ViewChild("searchBtn") searchBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("btnCloseSdv") btnCloseSdv?: ElementRef<HTMLButtonElement>;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private roleService: RoleService,
    private render2: Renderer2,
  ) {
    this.defaultRole = "ROLE_USER";
    this.initAddForm = false;
    this.isSelectedRow = false;

    this.initRolesBlock();
    this.initDisplayBlock();
  }

  ngAfterViewChecked(): void {

    this.checkTableRow();

    if (this.editUserBtn?.nativeElement && this.editUserForm) {
      this.render2.listen(this.editUserBtn.nativeElement, 'click', () =>
        this.openEditUserModel()
      );
    }

    if (this.editModalBtnClose?.nativeElement) {
      this.render2.listen(this.editModalBtnClose.nativeElement, 'click', () =>{
        this.closeEditUserModel();
      });
    }

    if (this.searchBtn?.nativeElement) {
      this.render2.listen(this.searchBtn.nativeElement, 'click', () => {
        this.sidenav?.open().then();
      });
    }

    if (this.btnCloseSdv?.nativeElement) {
      this.render2.listen(this.btnCloseSdv.nativeElement, 'click', () => {
        this.sidenav?.close().then();
      });
    }
  }

  ngOnInit(): void {
    this.roleService.setAllRoles();
    this.userService.loadingAllUsers();
    this.createSearchForm();
  }

  private initRolesBlock(): void {
    effect(() => {
      const roles = this.userRoles();

      if (roles && roles.length > 0 && !this.initAddForm) {
        this.createAddUserForm();
        this.initAddForm = true;

        if (this.addUserBtn?.nativeElement && this.addUserForm) {

          this.render2.listen(this.addUserBtn.nativeElement, 'click', () => {
            this.openAddUserModal();
          });

          if (this.addModelBtnClose?.nativeElement) {
            this.render2.listen(this.addModelBtnClose.nativeElement, 'click', () => {
              this.closeAddUserModal();
            });
          }
        }
      }
    })
  }

  private initDisplayBlock(): void {
    effect(() => {
      const users = this.userList();

      if (this.displayContent() === null) {
        if (users && users.length > 0) {
          this.displayContent.set(users);
        }
      }
    });
  }

  private checkTableRow(): void {
    if (this.usersBlock?.nativeElement && !this.isSelectedRow) {
      this.render2.listen(this.usersBlock.nativeElement, 'click', (e: Event) => {
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

              this.userId = Number.parseInt(r.dataset['userId'] as string);

              this.displayContent()!.forEach((user:IUser): void => {
                if (user.id === (this.userId as number)) {
                  this.selectUser = user;
                  return;
                }
              })

              if (this.selectUser) {
                this.createEditUserForm();

                if (this.removeUserBtn?.nativeElement) {
                  this.render2.listen(this.removeUserBtn.nativeElement, 'click', () => {
                    if (this.selectUser?.id) {
                      this.deleteUser(this.selectUser?.id);
                      this.selectUser = undefined;
                      this.isSelectedRow = false;
                      this.render2.setProperty(this.usersBlock!.nativeElement, 'checked', false);
                    }
                  });
                }
              }
            }
          }
        }
      );
    }
  }

  private openEditUserModel(): void {
    if (this.editUserModel?.nativeElement) {
      this.editUserModel.nativeElement.showModal();
    }
  }

  private closeEditUserModel(): void {
    if (this.editUserModel?.nativeElement) {
      this.editUserModel.nativeElement.close();
    }
  }

  private createEditUserForm(): void {
    this.editUserForm = new FormGroup({
      id: new FormControl(this.selectUser?.id),
      username: new FormControl({value: this.selectUser?.username, disabled: true}, Validators.required, ),
      password: new FormControl(''),
      firstName: new FormControl(this.selectUser?.firstName, Validators.required),
      lastName: new FormControl(this.selectUser?.lastName, Validators.required),
      email: new FormControl(this.selectUser?.email, [Validators.required, Validators.email]),
      birthday: new FormControl(this.selectUser?.birthday),
      active: new FormControl(this.selectUser?.active),
      roles: this.createCheckedRole()
    });
  }

  private openAddUserModal(): void {
    if (this.addUserModal?.nativeElement) {
      this.addUserModal.nativeElement.showModal();
    }
  }

  private closeAddUserModal(): void {
    if (this.addUserModal?.nativeElement) {
      this.addUserModal.nativeElement.close();
    }
  }

  private createCheckedRole(): FormGroup {
    const formGroup = new FormGroup({});
    const userRolesSet = new Set(this.selectUser?.roles.map(role => role.name));

    if (this.userRoles) {
      this.userRoles().forEach((role) => {
        const isSelected = userRolesSet.has(role.name);
        formGroup.addControl(role.name, new FormControl(isSelected));
      });
    }
    return formGroup;
  }

  private createAddUserForm(): void {
    this.addUserForm = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      firstName: new FormControl("", Validators.required),
      lastName: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      birthday: new FormControl(""),
      active: new  FormControl(""),
      roles: this.createEmptyRole()
    })
  }

  private createEmptyRole(): FormGroup {
    const formGroup = new FormGroup({});
    this.userRoles().forEach((role) => {
      const isDf: boolean = role.name.toUpperCase() === this.defaultRole;
      formGroup.addControl(role.name, new FormControl(isDf));
    })

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
    if (formValue) {
      const userRoles:IRole[]= Object.entries(formValue.roles)
        .filter(([_, checked]) => checked)
        .map(([name]) =>
          this.store.rolesEntities().find((role) => role.name === name)
        ).filter((role: IRole | undefined): role is IRole => this.isRole(role));

      const user: IUser = {
        id: formValue.id,
        username: this.selectUser!.username,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        birthday: formValue.birthday,
        active: formValue.active,
        roles: userRoles,
      };

      this.userService.updateUser(user).subscribe({
        next:(item: boolean): void => {
          if (item) {
            this.userService.loadingUserById(user.id).subscribe({
              next:(updateUser: IUser | null): void => {
                if (updateUser !== null) {
                  this.displayContent.update((u) => {
                    if (u) {
                      const index = u.findIndex((user: IUser) => user.id === updateUser.id);
                      console.log(index);
                      if (index !== -1) {
                        u[index] = updateUser;
                      }
                    }
                    return u;
                  })
                }
              }
            })
          }
        }
      })
    }

  }

  addingUser(): void {
    if (this.addUserForm?.invalid) {
      this.messageService.setMessage('Incorrect data provided');
      return;
    } else {
      this.messageService.setMessage(null);
    }

    const formValue = this.addUserForm?.value;

    if (formValue) {
      const _roles: IRole[] = Object.entries(formValue.roles)
        .filter(([_, checked]) => checked)
        .map(([name]) => this.store.rolesEntities().find((role)=> role.name === name))
        .filter((role: IRole | undefined): role is IRole => this.isRole(role))

      const newUser: INewUser = {
        username: formValue.username,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        birthday: formValue.birthday,
        active: formValue.active,
        roles: _roles
      }

      this.userService.addUserByAdmin(newUser).subscribe({
          next: (item: IUser | null): void => {
            if (item !== null) {
              const tmpArr: IUser[] = this.displayContent() || [];
              tmpArr.push(item);
              this.displayContent.set(tmpArr);
            }
          }
      });
    }
  }

  private deleteUser(id: number): void {
    this.userService.deleteUserById(id).subscribe({
      next:(item: boolean): void => {
        if (item) {
          if (this.displayContent() !== null) {
            const tmpArr: IUser[] = this.displayContent()!;
            for (let i = 0; i < tmpArr.length; i++) {
              if (tmpArr[i].id === id) {
                tmpArr.splice(i, 1);
                this.displayContent.set(tmpArr);
                break;
              }
            }
          }
        }
      }
    });
  }

  private isRole(role: IRole | undefined): role is IRole {
    return role !== undefined;
  }

  private createSearchForm(): void {
    this.searchDataForm = new FormGroup({
      search_username: new FormControl(""),
      search_email: new FormControl(""),
    })
  }

  searchUser(): void {
    const formValue = this.searchDataForm?.value;

    if (formValue) {
      this.searchList = this.userList().filter((user: IUser) => {
        return (
          (formValue.search_username ? user.username.includes(formValue.search_username) : true) &&
          (formValue.search_email ? user.email.includes(formValue.search_email) : true)
        );
      })

      if (this.searchList && this.searchList.length > 0) {
        this.displayContent.set(this.searchList);
      }
    }
  }

  clearSearch(): void {
    this.searchDataForm?.reset();
    this.searchList = [];
    this.searchList = undefined;
    this.displayContent.set(this.userList());
  }
}
