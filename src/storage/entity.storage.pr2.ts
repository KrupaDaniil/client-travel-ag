import { patchState, signalStore, type, withMethods } from "@ngrx/signals";
import { entityConfig, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { IAdminHotelEntity } from "../interfaces/hotels-block/i-admin-hotel.entity";

const adminHotelConfig = entityConfig({
	entity: type<IAdminHotelEntity>(),
	collection: "adminHotels",
	selectId: adminHotel => adminHotel.id
});

export const EntityStoragePr2 = signalStore(
	{ providedIn: "root" },

	withEntities(adminHotelConfig),
	withMethods(store => ({
		setAdminHotel(adminHotel: IAdminHotelEntity): void {
			patchState(store, setEntity(adminHotel, adminHotelConfig));
		},

		setAllEntities(adminHotels: IAdminHotelEntity[]): void {
			patchState(store, setAllEntities(adminHotels, adminHotelConfig));
		},

		removeEntity(id: number): void {
			patchState(store, removeEntity(id, adminHotelConfig));
		}
	}))
);
