import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { EntityStorage } from "../storage/entity.storage";

export const authUserGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
	const store = inject(EntityStorage);

	if (store.username() !== "" && store.roles().length > 0) {
		return true;
	} else {
		window.location.href = "/login";
		return false;
	}
};
