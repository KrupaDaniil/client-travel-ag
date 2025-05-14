import { patchState, signalStore, type, withMethods, withState } from "@ngrx/signals";
import {
	addEntity,
	entityConfig,
	EntityId,
	removeEntities,
	removeEntity,
	setAllEntities,
	setEntity,
	updateEntity,
	withEntities
} from "@ngrx/signals/entities";
import { IUser } from "../interfaces/i-user";
import { IRole } from "../interfaces/i-role";
import { IUserStartData } from "../interfaces/user-auth/i-user-start-data";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { IClimateEntity } from "../interfaces/country-block/i-climate.entity";
import { ILanguageEntity } from "../interfaces/country-block/i-language.entity";
import { ICountryEntity } from "../interfaces/country-block/i-country.entity";
import { ICityEntity } from "../interfaces/country-block/i-city.entity";
import { IMainCountryForCityEntity } from "../interfaces/country-block/i-main-country-for-city.entity";
import { IBlobImageEntity } from "../interfaces/country-block/i-blob-image.entity";
import { IFromToEntity } from "../interfaces/filters-block/i-from-to.entity";
import { IFromCountryEntity } from "../interfaces/filters-block/i-from-country.entity";

function loadUserStartData(): () => IUserStartData {
	return () => {
		const authService = inject(AuthService);
		const userData: IUserStartData | null = authService.getUserStartData();
		if (userData != null) {
			return userData;
		} else {
			return { roles: [], username: "" };
		}
	};
}

const userConfig = entityConfig({
	entity: type<IUser>(),
	collection: "users",
	selectId: user => user.id
});

const roleConfig = entityConfig({
	entity: type<IRole>(),
	collection: "roles",
	selectId: role => role.id
});

const climateConfig = entityConfig({
	entity: type<IClimateEntity>(),
	collection: "climates",
	selectId: climate => climate.id
});

const languageConfig = entityConfig({
	entity: type<ILanguageEntity>(),
	collection: "languages",
	selectId: language => language.id
});

const countryConfig = entityConfig({
	entity: type<ICountryEntity>(),
	collection: "countries",
	selectId: country => country.id
});

const cityConfig = entityConfig({
	entity: type<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>>(),
	collection: "admin_cities",
	selectId: admin_city => admin_city.id
});

const fromToConfig = entityConfig({
	entity: type<IFromToEntity>(),
	collection: "fromToEntities",
	selectId: formToEntities => formToEntities.id
});

const fromToCountryConfig = entityConfig({
	entity: type<IFromCountryEntity>(),
	collection: "fromToCountries",
	selectId: fromToCountries => fromToCountries.id
});

export const EntityStorage = signalStore(
	{ providedIn: "root" },

	withState<IUserStartData>(loadUserStartData()),
	withEntities(userConfig),
	withEntities(roleConfig),
	withEntities(climateConfig),
	withEntities(languageConfig),
	withEntities(countryConfig),
	withEntities(cityConfig),
	withEntities(fromToConfig),
	withEntities(fromToCountryConfig),
	withMethods(store => ({
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
		setCountry(country: ICountryEntity): void {
			patchState(store, setEntity(country, countryConfig));
		},
		setAdminCity(city: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): void {
			patchState(store, setEntity(city, cityConfig));
		},
		setFromToEntity(fromTo: IFromToEntity): void {
			patchState(store, setEntity(fromTo, fromToConfig));
		},
		setFromToCountry(fromToCountry: IFromCountryEntity): void {
			patchState(store, setEntity(fromToCountry, fromToCountryConfig));
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
		setAllCountries(countries: ICountryEntity[]): void {
			patchState(store, setAllEntities(countries, countryConfig));
		},
		setAllAdminCities(cities: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]): void {
			patchState(store, setAllEntities(cities, cityConfig));
		},
		setAllFromToEntities(fromToEntities: IFromToEntity[]): void {
			patchState(store, setAllEntities(fromToEntities, fromToConfig));
		},
		setAllFromToCountries(fromToCountries: IFromCountryEntity[]): void {
			patchState(store, setAllEntities(fromToCountries, fromToCountryConfig));
		},

		updateUserStartData(userStartData: Partial<IUserStartData>): void {
			if (Object.keys(userStartData).length > 0) {
				patchState(store, state => ({
					...state,
					...userStartData
				}));
			}
		},

		removeUserStartData(): void {
			patchState(store, { roles: [], username: "" });
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
		removeCountry(id: number): void {
			patchState(store, removeEntity(id, countryConfig));
		},
		removeCity(id: number): void {
			patchState(store, removeEntity(id, cityConfig));
		},
		removeFromToEntity(id: number): void {
			patchState(store, removeEntity(id, fromToConfig));
		},
		removeFromToCountry(id: number): void {
			patchState(store, removeEntity(id, fromToCountryConfig));
		}
	}))
);
