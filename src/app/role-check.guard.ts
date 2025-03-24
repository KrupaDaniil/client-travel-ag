import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {computed, inject} from '@angular/core';
import {EntityStorage} from '../storage/entity.storage';
import {UserRoles} from './enums/user-roles';

export const roleCheckGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const store = inject(EntityStorage);
  const router: Router = inject(Router);
  const roles = computed(()=> store.roles());

  for (const role of roles()) {
    if (role.toUpperCase() === UserRoles.MANAGER || role.toUpperCase() === UserRoles.ADMIN) {
      return true;
    }
  }

  return router.parseUrl("/error-403");
};
