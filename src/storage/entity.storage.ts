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
  EntityId,
  removeEntities,
  removeEntity,
  setAllEntities,
  setEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { IUser } from '../interfaces/i-user';
import { IRole } from '../interfaces/i-role';
import { IUserStartData } from '../interfaces/user-auth/i-user-start-data';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { IClimateEntity } from '../interfaces/country-block/i-climate.entity';
import { ILanguageEntity } from '../interfaces/country-block/i-language.entity';

function loadUserStartData(): () => IUserStartData {
  return () => {
    const authService = inject(AuthService);
    const userData: IUserStartData | null = authService.getUserStartData();
    if (userData != null) {
      return userData;
    } else {
      return { roles: [], username: '' };
    }
  };
}

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

const climateConfig = entityConfig({
  entity: type<IClimateEntity>(),
  collection: 'climates',
  selectId: (climate) => climate.id,
});

const languageConfig = entityConfig({
  entity: type<ILanguageEntity>(),
  collection: 'languages',
  selectId: (language) => language.id,
});

export const EntityStorage = signalStore(
  { providedIn: 'root' },

  withState<IUserStartData>(loadUserStartData()),
  withEntities(userConfig),
  withEntities(roleConfig),
  withEntities(climateConfig),
  withEntities(languageConfig),
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
      patchState(store, setEntity(user, userConfig));
    },
    setRole(role: IRole): void {
      patchState(store, setEntity(role, roleConfig));
    },
    setClimate(climate: IClimateEntity): void {
      patchState(store, setEntity(climate, climateConfig));
    },
    setLanguage(language: ILanguageEntity): void {
      patchState(store, setEntity(language, languageConfig));
    },

    setAllUsers(users: IUser[]): void {
      patchState(store, setAllEntities(users, userConfig));
    },
    setAllRoles(roles: IRole[]): void {
      patchState(store, setAllEntities(roles, roleConfig));
    },
    setAllClimates(climates: IClimateEntity[]): void {
      patchState(store, setAllEntities(climates, climateConfig));
    },
    setAllLanguages(languages: ILanguageEntity[]): void {
      patchState(store, setAllEntities(languages, languageConfig));
    },
    updateUserStartData(userStartData: Partial<IUserStartData>): void {
      if (Object.keys(userStartData).length > 0) {
        patchState(store, (state) => ({
          ...state,
          ...userStartData,
        }));
      }
    },

    removeUserStartData(): void {
      patchState(store, { roles: [], username: '' });
    },
    removeUser(id: number): void {
      patchState(store, removeEntity(id, userConfig));
    },
    removeUsers(ids: EntityId[]): void {
      patchState(store, removeEntities(ids, userConfig));
    },
    removeRole(id: number): void {
      patchState(store, removeEntity(id, roleConfig));
    },
    removeClimate(id: number): void {
      patchState(store, removeEntity(id, climateConfig));
    },
    removeLanguage(id: number): void {
      patchState(store, removeEntity(id, languageConfig));
    },
  }))
);
