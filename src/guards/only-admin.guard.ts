import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { EntityStorage } from "../storage/entity.storage";
import { UserRoles } from "../app/enums/user-roles";

export const onlyAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
	const store = inject(EntityStorage);
	const roles: string[] = store.roles();

	if (roles.length === 0) {
		window.location.href = "/login";
		return false;
	}

	let isAdmin: boolean = false;

	for (const role of roles) {
		if (role.toLocaleUpperCase() === UserRoles.ADMIN) {
			isAdmin = true;
		}
	}

	if (isAdmin) {
		return true;
	} else {
		window.location.href = "/forbidden";
		return false;
	}
};
