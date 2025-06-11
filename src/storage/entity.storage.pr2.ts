import {patchState, signalStore, type, withMethods} from "@ngrx/signals";
import {entityConfig, removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {IAdminHotelEntity} from "../interfaces/hotels-block/i-admin-hotel.entity";
import {IMinCountryEntity} from '../interfaces/country-block/i-min-country.entity';

const adminHotelConfig = entityConfig({
  entity: type<IAdminHotelEntity>(),
  collection: "adminHotels",
  selectId: adminHotel => adminHotel.id
});

const minCountryConfig = entityConfig({
  entity: type<IMinCountryEntity>(),
  collection: "minCountries",
  selectId: minCountry => minCountry.id
});

export const EntityStoragePr2 = signalStore(
  {providedIn: "root"},

  withEntities(adminHotelConfig),
  withEntities(minCountryConfig),
  withMethods(store => ({
    setAdminHotel(adminHotel: IAdminHotelEntity): void {
      patchState(store, setEntity(adminHotel, adminHotelConfig));
    },
    setMinCountry(minCountry: IMinCountryEntity): void {
      patchState(store, setEntity(minCountry, minCountryConfig));
    },
    setAllAdminHotels(adminHotels: IAdminHotelEntity[]): void {
      patchState(store, setAllEntities(adminHotels, adminHotelConfig));
    },
    setAllMinCountries(minCountries: IMinCountryEntity[]): void {
      patchState(store, setAllEntities(minCountries, minCountryConfig));
    },

    removeAdminHotel(id: number): void {
      patchState(store, removeEntity(id, adminHotelConfig));
    },
    removeMinCountry(id: number): void {
      patchState(store, removeEntity(id, minCountryConfig));
    }
  }))
);
