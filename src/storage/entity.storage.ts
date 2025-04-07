import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  setEntity, updateEntities, updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { IUser } from '../interfaces/i-user';
import { IRole } from '../interfaces/i-role';
import { IUserStartData } from '../interfaces/user-auth/i-user-start-data';

const userConfig = entityConfig({
  entity: type<IUser>(),
  collection: 'users',
  selectId: (user) => user.id,
});

const roleConfig = entityConfig({
  entity: type<IRole>(),
  collection: 'roles',
  selectId: (role) => role.id,
});

export const EntityStorage = signalStore(
  { providedIn: 'root' },
  withState<IUserStartData>({
    roles: [],
    username: '',
  }),
  withEntities(userConfig),
  withEntities(roleConfig),
  withMethods((store) => ({
    addUserStartData(startData: IUserStartData): void {
      patchState(store, startData);
    },
    addUser(user: IUser): void {
      patchState(store, addEntity(user, userConfig));
    },
    addRole(role: IRole): void {
      patchState(store, addEntity(role, roleConfig));
    },

    setUser(user: IUser): void {
      patchState(store, updateEntity({id: user.id, changes: user}, userConfig));
    },
    setRole(role: IRole): void {
      patchState(store, updateEntity({id: role.id, changes: role}, roleConfig));
    },
    setAllUsers(users: IUser[]): void {
      patchState(store, setAllEntities(users, userConfig));
    },
    setAllRoles(roles: IRole[]): void {
      patchState(store, setAllEntities(roles, roleConfig));
    },

    removeUserStartData(): void {
      patchState(store, { roles: [], username: '' });
    },
    removeUser(id: number): void {
      patchState(store, removeEntity(id, userConfig));
    },
    removeRole(id: number): void {
      patchState(store, removeEntity(id, roleConfig));
    },
  }))
);
