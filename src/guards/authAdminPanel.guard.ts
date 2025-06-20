import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { EntityStorage } from "../storage/entity.storage";
import { UserRoles } from "../app/enums/user-roles";

export const authAdminPanelGuard: CanActivateFn = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
): boolean => {
	const stor = inject(EntityStorage);

	const username: string = stor.username();
	const roles: string[] = stor.roles();
	let isAdmin: boolean = false;
	let isManager: boolean = false;

	if (username === "" || roles.length === 0) {
		window.location.href = "/login";
		return false;
	}

	for (const role of roles) {
		if (role.toLocaleUpperCase() === UserRoles.ADMIN) {
			isAdmin = true;
		}

		if (role.toLocaleUpperCase() === UserRoles.MANAGER) {
			isManager = true;
		}
	}

	if (isAdmin || isManager) {
		return true;
	} else {
		window.location.href = "/forbidden";
		return false;
	}
};
