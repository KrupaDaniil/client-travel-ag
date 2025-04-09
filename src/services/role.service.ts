import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { EntityStorage } from '../storage/entity.storage';
import { IRole } from '../interfaces/i-role';
import { IError } from '../interfaces/i-error';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private store = inject(EntityStorage);

  constructor(private http: HttpService, private message: MessageService) {}

  setAllRoles(): void {
    this.http.loadingAllRoles().subscribe({
      next: (item: IRole[] | IError): void => {
        if (this.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          for (const rl of item as IRole[]) {
            this.store.addRole(rl);
          }
        }
      }
    });
  }

  addUserRole(role: IRole): void {
    this.http.addRole(role).subscribe({
      next: (item: IRole | IError): void => {
        if (this.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.addRole(item as IRole);
        }
      }
    });
  }

  deleteUserRole(id: number): void {
    this.http.deleteRole(id).subscribe({
      next: (item: boolean | IError): void => {
        if (this.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          if (item === true) {
            this.message.setMessage(null);
            this.store.removeRole(id);
          }
        }
      }
    });
  }

  private isError(item: any): boolean {
    return item !== null && typeof item === "object" && "timestamp" in item && item.timestamp instanceof Date;
  }
}
