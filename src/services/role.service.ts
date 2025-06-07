import { inject, Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { EntityStorage } from "../storage/entity.storage";
import { IRole } from "../interfaces/i-role";
import { IError } from "../interfaces/i-error";
import { MessageService } from "./message.service";
import { INewRole } from "../interfaces/i-new-role";
import { ValidationService } from "./validation.service";
import { firstValueFrom, map } from "rxjs";

@Injectable({
	providedIn: "root"
})
export class RoleService {
	private store = inject(EntityStorage);

	constructor(private http: HttpService, private message: MessageService, private check: ValidationService) {}

	setAllRoles(): void {
		this.http.loadingAllRoles().subscribe({
			next: (item: IRole[] | IError): void => {
				if (this.check.isError(item)) {
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

	async getRoleByName(roleName: string): Promise<IRole | undefined> {
		return await firstValueFrom(
			this.http.loadingRoleByName(roleName).pipe(
				map((item: IRole | IError): IRole | undefined => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return undefined;
					} else {
						this.message.setMessage(null);
						return item as IRole;
					}
				})
			)
		);
	}

	addUserRole(role: INewRole): void {
		this.http.addRole(role).subscribe({
			next: (item: IRole | IError): void => {
				if (this.check.isError(item)) {
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
				if (this.check.isError(item)) {
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
}
