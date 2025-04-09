import {Component, computed, ElementRef, inject, OnInit, Renderer2, Signal, ViewChild} from '@angular/core';
import {EntityStorage} from '../../../storage/entity.storage';
import {IRole} from '../../../interfaces/i-role';
import {MessageService} from '../../../services/message.service';
import {RoleService} from '../../../services/role.service';

@Component({
  selector: 'app-role-management',
  imports: [],
  providers: [RoleService, MessageService],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent implements OnInit {
  private readonly store = inject(EntityStorage);
  private roleId: number | undefined;
  private selectRole: IRole | undefined;
  userRoles: Signal<IRole[]> = computed(() => this.store.rolesEntities());
  errorMessage: Signal<string | null> = computed(() => this.messageService.message());

  @ViewChild("rolesBlock") rolesBlock?: ElementRef<HTMLTableSectionElement>;
  @ViewChild("addRoleBtn") addRoleBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild("removeRoleBtn") removeRoleBtn?: ElementRef<HTMLButtonElement>;

  constructor(private roleService: RoleService, private messageService: MessageService, private render_2: Renderer2) {
  }

  ngOnInit(): void {
    this.roleService.setAllRoles();
  }
}
