import { inject, Injectable } from '@angular/core';
import { EntityStorage } from '../storage/entity.storage';
import { IUserStartData } from '../interfaces/user-auth/i-user-start-data';
import { IUserLogin } from '../interfaces/user-auth/i-user-login';
import { HttpService } from './http.service';
import { IError } from '../interfaces/i-error';
import { MessageService } from './message.service';
import { IUserReg } from '../interfaces/user-auth/i-user-reg';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from './auth.service';
import {firstValueFrom, map, Observable, of, switchMap} from 'rxjs';
import { ITokenData } from '../interfaces/user-auth/i-token-data';
import { UserStartData } from '../models/user-start-data';
import { IUser } from '../interfaces/i-user';
import {INewUser} from '../interfaces/i-new-user';
import {IUserInfo} from '../interfaces/user-auth/i-user-info';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly store = inject(EntityStorage);

  constructor(
    private http: HttpService,
    private messageService: MessageService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  singIn(user: IUserLogin): Observable<boolean> {
    return this.http.loginUser(user).pipe(
      switchMap((item: IUserStartData | IError | null): Observable<boolean> => {
        if (item !== null) {
          if (this.isUser(item)) {
            this.store.addUserStartData(item as IUserStartData);
            this.router.navigate(['/']).then();
            return of(true);
          } else if (this.isError(item)) {
            return this.http.checkUsername(user.username).pipe(
              map((res: boolean): boolean => {
                res
                  ? this.messageService.setMessage('Incorrect password entered')
                  : this.messageService.setMessage('Such a user does not exist');
                return false;
              })
            );
          } else {
            this.messageService.setMessage(null);
            return of(false);
          }
        }
        return of(false);
      })
    );
  }

  singInOAuth2(): boolean {
    let flag: boolean = false;
    this.activeRoute.fragment.subscribe((fragment: string | null): void => {
      if (fragment !== null && fragment !== undefined) {
        const pr = new URLSearchParams(fragment);
        const token = pr.get('token');
        if (token) {
          this.authService.setToken(token);
          const data: ITokenData | null = this.authService.getDecodeToken();
          if (data != null) {
            this.store.addUserStartData(new UserStartData(data.roles, data.sub));
            flag = true;
            this.router.navigate(['/']).then();
          }
        }
      }
    });

    this.activeRoute.queryParams.subscribe((params: Params): void => {
      if (params['error']) {
        this.messageService.setMessage('Authorization error');
      } else {
        this.messageService.setMessage(null);
      }
    });

    return flag;
  }

  singUp(user: IUserReg): void {
    this.http.registrationUser(user).subscribe({
      next: (item: boolean | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          if (item === true) {
            this.router.navigate(['/successful-registration']).then();
          } else {
            this.router.navigate(['/error-data']).then();
          }
        }
      },
    });
  }

  singOut(): void {
    this.authService.removeToken();
    this.store.removeUserStartData();
    this.router.navigate(['/']).then();
  }

  loadingAllUsers(): void {
    this.http.loadingAllUsers().subscribe({
      next: (item: IUser[] | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          this.messageService.setMessage(null);
          for (const user of item as IUser[]) {
            this.store.addUser(user);
          }
        }
      },
    });
  }

  loadingUserById(id: number): void {
    this.http.loadingUserById(id).subscribe({
      next: (item: IUser | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          this.messageService.setMessage(null);
          this.store.setUser(item as IUser);
          console.log(this.store.usersEntities().filter(user => user.id === id));
        }
      },
    });
  }

  async loadingUserByUsername(username: string): Promise<IUserInfo | null>{
    return await firstValueFrom(
      this.http.loadingUserByUsername(username).pipe(
      map((item: IUserInfo | IError): IUserInfo | null => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
          return null;
        } else {
          this.messageService.setMessage(null);
          return item as IUserInfo;
        }
      })
    ));
  }

  addUserByAdmin(user: INewUser): void {
    this.http.addUser(user).subscribe({
      next: (item: IUser | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          this.messageService.setMessage(null);
          this.store.addUser(item as IUser);
        }
      }
    });
  }

  updateUser(user: IUser): void {
    this.http.updateUser(user).subscribe({
      next:(item: boolean | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          if (item === true) {
            this.messageService.setMessage(null);
            this.loadingUserById(user.id);
          }
        }
      }
    });
  }

  deleteUserById(id: number): void {
    this.http.deleteUser(id).subscribe({
      next: (item: boolean | IError): void => {
        if (this.isError(item)) {
          this.messageService.setMessage((item as unknown as IError).message);
        } else {
          if (item === true) {
            this.messageService.setMessage(null);
            this.store.removeUser(id);
          }
        }
      }
    })
  }

  private isUser(item: any): boolean {
    return 'roles' in item && Array.isArray(item.roles);
  }

  private isError(item: any): boolean {
    return item !== null && typeof item === "object" && "timestamp" in item && item.timestamp instanceof Date;
  }
}
