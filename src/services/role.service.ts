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

  private isError(item: any): boolean {
    return 'timestamp' in item && item.timestamp instanceof Date;
  }
}
