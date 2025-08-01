import { inject, Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { map, Observable } from "rxjs";
import { EntityStorage } from "../storage/entity.storage";

@Injectable({
	providedIn: "root"
})
export class ValidationService {
	private readonly store = inject(EntityStorage);

	constructor(private http: HttpService) {}

	validationUsername(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.http.checkUsername(control.value).pipe(
				map((res: boolean) => {
					if (res) {
						return { checkUsername: true };
					} else {
						return null;
					}
				})
			);
		};
	}

	isError(item: any): boolean {
		return (
			item !== null &&
			typeof item === "object" &&
			typeof item.status === "number" &&
			typeof item.message === "string" &&
			typeof item.message === "string" &&
			((typeof item.timestamp === "string" && !isNaN(Date.parse(item.timestamp))) ||
				(typeof item.timestamp === "number" && !isNaN(new Date(item.timestamp).getTime())) ||
				(item.timestamp instanceof Date && !isNaN(item.timestamp.getTime())))
		);
	}

	isLoginError(item: any): boolean {
		return (
			item !== null &&
			typeof item === "object" &&
			(item.usernameError === null || typeof item.usernameError === "string") &&
			(item.passwordError === null || typeof item.passwordError === "string")
		);
	}

	isUser(item: any): boolean {
		return item !== null && typeof item === "object" && "roles" in item && Array.isArray(item.roles);
	}

	isHttpError(item: any): boolean {
		return (
			item !== null &&
			typeof item === "object" &&
			typeof item.status === "number" &&
			typeof item.message === "string" &&
			typeof item.message === "string");
	}
}
