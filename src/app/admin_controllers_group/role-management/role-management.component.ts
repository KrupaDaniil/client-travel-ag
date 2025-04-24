import {
  AfterViewChecked,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  Signal,
  ViewChild,
} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { IRole } from '../../../interfaces/i-role';
import { MessageService } from '../../../services/message.service';
import { RoleService } from '../../../services/role.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { INewRole } from '../../../interfaces/i-new-role';

@Component({
  selector: 'app-role-management',
  imports: [ReactiveFormsModule],
  providers: [RoleService, MessageService],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css',
})
export class RoleManagementComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(EntityStorage);
  private roleId: number | undefined;
  private selectRole: IRole | undefined;
  private isSelectedRow: boolean;
  roleName: FormControl;
  userRoles: Signal<IRole[]> = computed(() => this.store.rolesEntities());
  errorMessage: Signal<string | null> = computed(() =>
    this.messageService.message()
  );

  @ViewChild('rolesBlock') rolesBlock?: ElementRef<HTMLTableSectionElement>;
  @ViewChild('addRoleBtn') addRoleBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('removeRoleBtn') removeRoleBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('addRoleBlock') addRoleBlock?: ElementRef<HTMLDivElement>;
  @ViewChild('buttonsGroup') buttonsGroup?: ElementRef<HTMLDivElement>;

  constructor(
    private roleService: RoleService,
    private messageService: MessageService,
    private render_2: Renderer2
  ) {
    this.isSelectedRow = false;
    this.roleName = new FormControl('', Validators.required);
  }

  ngAfterViewChecked(): void {
    this.selectTableRow();

    if (
      this.addRoleBtn?.nativeElement &&
      this.addRoleBlock?.nativeElement &&
      this.buttonsGroup?.nativeElement
    ) {
      this.render_2.listen(this.addRoleBtn.nativeElement, 'click', () => {
        this.render_2.addClass(this.buttonsGroup?.nativeElement, 'hide-block');
        this.render_2.addClass(this.addRoleBlock?.nativeElement, 'show-block');
      });
    }
  }

  ngOnInit(): void {
    this.roleService.setAllRoles();
  }

  private selectTableRow(): void {
    if (this.rolesBlock?.nativeElement && !this.isSelectedRow) {
      this.isSelectedRow = true;
      this.render_2.listen(
        this.rolesBlock.nativeElement,
        'click',
        (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.tagName.toLowerCase() === 'td') {
            const row = target.closest('tr') as HTMLTableRowElement;
            if (row) {
              const rd = row.querySelector(
                'input[type="radio"]'
              ) as HTMLInputElement;
              if (rd) {
                this.render_2.setProperty(rd, 'checked', true);
              }
              this.roleId = Number.parseInt(row.dataset['roleId'] as string);
              this.userRoles().forEach((role: IRole): void => {
                if (role.id === this.roleId) {
                  this.selectRole = role;
                  return;
                }
              });

              if (this.selectRole) {
                if (this.removeRoleBtn?.nativeElement) {
                  this.render_2.listen(
                    this.removeRoleBtn.nativeElement,
                    'click',
                    () => {
                      if (this.selectRole?.id) {
                        this.roleService.deleteUserRole(this.selectRole.id);
                        this.selectRole = undefined;
                        this.isSelectedRow = false;
                        this.render_2.setProperty(
                          this.rolesBlock!.nativeElement,
                          'checked',
                          false
                        );
                      }
                    }
                  );
                }
              }
            }
          }
        }
      );
    }
  }

  createRole(): void {
    if (this.roleName.value) {
      this.roleService.addUserRole({ name: this.roleName.value } as INewRole);
      this.roleName.reset();
      this.render_2.removeClass(this.addRoleBlock?.nativeElement, 'show-block');
      this.render_2.removeClass(this.buttonsGroup?.nativeElement, 'hide-block');
    }
  }

  cancel(): void {
    this.render_2.removeClass(this.addRoleBlock?.nativeElement, 'show-block');
    this.render_2.removeClass(this.buttonsGroup?.nativeElement, 'hide-block');
  }
}
