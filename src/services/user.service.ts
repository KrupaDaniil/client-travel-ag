import { inject, Injectable } from "@angular/core";
import { EntityStorage } from "../storage/entity.storage";
import { IUserStartData } from "../interfaces/user-auth/i-user-start-data";
import { IUserLogin } from "../interfaces/user-auth/i-user-login";
import { HttpService } from "./http.service";
import { IError } from "../interfaces/i-error";
import { MessageService } from "./message.service";
import { IUserReg } from "../interfaces/user-auth/i-user-reg";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { firstValueFrom, map, Observable, of, switchMap } from "rxjs";
import { ITokenData } from "../interfaces/user-auth/i-token-data";
import { UserStartData } from "../models/user-start-data";
import { IUser } from "../interfaces/i-user";
import { INewUser } from "../interfaces/i-new-user";
import { IUserInfo } from "../interfaces/user-auth/i-user-info";
import { ValidationService } from "./validation.service";
import { ILoginError } from "../interfaces/i-login-error";
import { IMinUser } from "../interfaces/i-min-user";
import { LocalConstants } from "../app/enums/local-constants";

@Injectable({
	providedIn: "root"
})
export class UserService {
	readonly store = inject(EntityStorage);

	constructor(
		private http: HttpService,
		private messageService: MessageService,
		private activeRoute: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private check: ValidationService
	) {}

	private goRedirect(): void {
		const lastURL: string | null = localStorage.getItem(LocalConstants.L_URL);
		if (lastURL && lastURL.trim() !== "") {
			this.router.navigateByUrl(lastURL);
			localStorage.setItem(LocalConstants.L_URL, "");
		} else {
			this.router.navigate(["/"]).then();
		}
	}

	singIn(user: IUserLogin): Observable<void | ILoginError | IError> {
		return this.http.loginUser(user).pipe(
			switchMap((item: IUserStartData | ILoginError | IError): Observable<void | ILoginError | IError> => {
				if (this.check.isUser(item)) {
					this.store.addUserStartData(item as IUserStartData);
					this.goRedirect();
				}
				if (this.check.isLoginError(item)) {
					return of(item as ILoginError);
				}
				if (this.check.isError(item)) {
					return of(item as IError);
				}

				return of(void 0);
			})
		);
	}

	singInOAuth2(): boolean {
		let flag: boolean = false;
		this.activeRoute.fragment.subscribe((fragment: string | null): void => {
			if (fragment !== null && fragment !== undefined) {
				const pr = new URLSearchParams(fragment);
				const token = pr.get("token");
				if (token) {
					this.authService.setToken(token);
					const data: ITokenData | null = this.authService.getDecodeToken();
					if (data != null) {
						this.store.addUserStartData(new UserStartData(data.roles, data.sub));
						flag = true;
						this.goRedirect();
					}
				}
			}
		});

		this.activeRoute.queryParams.subscribe((params: Params): void => {
			if (params["error"]) {
				this.messageService.setMessage("Authorization error");
			} else {
				this.messageService.setMessage(null);
			}
		});

		return flag;
	}

	singUp(user: IUserReg): void {
		this.http.registrationUser(user).subscribe({
			next: (item: boolean | IError): void => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
				} else {
					if (item === true) {
						this.router.navigate(["/successful-registration"]).then();
					} else {
						this.router.navigate(["/error-data"]).then();
					}
				}
			}
		});
	}

	singOut(): void {
		this.authService.removeToken();
		this.store.removeUserStartData();
		this.router.navigate(["/"]).then();
	}

	loadingAllUsers(): void {
		this.http.loadingAllUsers().subscribe({
			next: (item: IUser[] | IError): void => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
				} else {
					this.messageService.setMessage(null);
					this.store.setAllUsers(item as IUser[]);
				}
			}
		});
	}

	async loadingAllManagers(roleId: number): Promise<IMinUser[] | undefined> {
		return await firstValueFrom(
			this.http.loadingAllManagers(roleId).pipe(
				map((item: IMinUser[] | IError): IMinUser[] | undefined => {
					if (this.check.isError(item)) {
						this.messageService.setMessage((item as IError).message);
						return undefined;
					} else {
						this.messageService.setMessage(null);
						return item as IMinUser[];
					}
				})
			)
		);
	}

	loadingUserById(id: number): Observable<IUser | null> {
		return this.http.loadingUserById(id).pipe(
			map((item: IUser | IError): IUser | null => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
					return null;
				} else {
					this.messageService.setMessage(null);
					this.store.setUser(item as IUser);
					return item as IUser;
				}
			})
		);
	}

	async loadingMinUserByUsername(username: string): Promise<IMinUser | undefined> {
		return await firstValueFrom(
			this.http.loadingMinUserByUsername(username).pipe(
				map((item: IMinUser | IError): IMinUser | undefined => {
					if (this.check.isError(item)) {
						this.messageService.setMessage((item as IError).message);
						return undefined;
					} else {
						this.messageService.setMessage(null);
						return item as IMinUser;
					}
				})
			)
		);
	}

	async loadingUserByUsername(username: string): Promise<IUserInfo | null> {
		return await firstValueFrom(
			this.http.loadingUserByUsername(username).pipe(
				map((item: IUserInfo | IError): IUserInfo | null => {
					if (this.check.isError(item)) {
						this.messageService.setMessage((item as unknown as IError).message);
						return null;
					} else {
						this.messageService.setMessage(null);
						return item as IUserInfo;
					}
				})
			)
		);
	}

	addUserByAdmin(user: INewUser): Observable<IUser | null> {
		return this.http.addUser(user).pipe(
			map((item: IUser | IError): IUser | null => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
					return null;
				} else {
					this.messageService.setMessage(null);
					this.store.addUser(item as IUser);
					return item as IUser;
				}
			})
		);
	}

	updateUser(user: IUser): Observable<boolean> {
		return this.http.updateUser(user).pipe(
			map((item: boolean | IError): boolean => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
					return false;
				} else {
					if (item === true) {
						this.messageService.setMessage(null);
						return true;
					} else {
						return false;
					}
				}
			})
		);
	}

	async updateUserByUser(user: IUserInfo): Promise<IUserInfo | null> {
		return await firstValueFrom(
			this.http.updateUserInfo(user).pipe(
				map(async (item: IUserInfo | IError): Promise<IUserInfo | null> => {
					if (this.check.isError(item)) {
						this.messageService.setMessage((item as unknown as IError).message);
						return null;
					} else {
						this.messageService.setMessage(null);
						return item as IUserInfo;
					}
				})
			)
		);
	}

	deleteUserById(id: number): Observable<boolean> {
		return this.http.deleteUser(id).pipe(
			map((item: boolean | IError): boolean => {
				if (this.check.isError(item)) {
					this.messageService.setMessage((item as unknown as IError).message);
					return false;
				} else {
					if (item === true) {
						this.messageService.setMessage(null);
						this.store.removeUser(id);
						return true;
					}

					return false;
				}
			})
		);
	}
}
