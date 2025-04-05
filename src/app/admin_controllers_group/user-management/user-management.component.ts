import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject, OnDestroy,
  OnInit,
  Renderer2,
  Signal,
  ViewChild, ViewChildren
} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../interfaces/i-user';
import {MessageService} from '../../../services/message.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-user-management',
  imports: [],
  providers: [UserService, MessageService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit, AfterViewChecked {
  private store = inject(EntityStorage);
  userList: Signal<IUser[]> = computed(() => this.store.usersEntities());
  errorMessage: Signal<string | null> = computed(() => this.messageService.message());
  private userId: number | undefined;
  @ViewChild("usersBlock") usersBlock?: ElementRef<HTMLTableSectionElement>;

  constructor(private userService: UserService, private messageService: MessageService,
              private render2: Renderer2, private elementRef: ElementRef) { }

  ngAfterViewChecked(): void {
    if(this.usersBlock?.nativeElement) {
      this.render2.listen(this.usersBlock.nativeElement, "click", (e: Event) => {
        const t = e.target as HTMLElement;
        if (t.tagName.toLowerCase() === "td") {
          const r = t.closest("tr") as HTMLTableRowElement;
          if (r) {
            const allRadios = this.usersBlock?.nativeElement.querySelectorAll('input[type="radio"]');
            allRadios?.forEach((radio: Element):void => {
              this.render2.setProperty(radio, "checked", false);
            });

            const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
            if (radio) {
              this.render2.setProperty(radio, "checked", true);
            }

            this.userId = r.dataset["userId"] as unknown as number;
          }
        }
      })
    }
  }

  ngOnInit(): void {
    this.userService.loadingAllUsers();
  }
}
