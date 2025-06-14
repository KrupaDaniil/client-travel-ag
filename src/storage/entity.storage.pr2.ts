import { patchState, signalStore, type, withMethods } from "@ngrx/signals";
import { entityConfig, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { IAdminHotelEntity } from "../interfaces/hotels-block/i-admin-hotel.entity";
import { IMinCountryEntity } from "../interfaces/country-block/i-min-country.entity";
import { IRoomTypeEntity } from "../interfaces/hotels-block/i-room-type.entity";
import { IFoodTypeEntity } from "../interfaces/hotels-block/i-food-type.entity";
import { IAdminRoomType } from "../interfaces/hotels-block/i-admin-room-type";
import { IAdminFoodType } from "../interfaces/hotels-block/i-admin-food-type";
import {IHotelFeedbackEntity} from '../interfaces/hotels-block/i-hotel-feedback.entity';
import {IHotelDetailsEntity} from '../interfaces/hotels-block/i-hotel-details.entity';

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

const hotelFeedbacksConfig = entityConfig(
  {
    entity:type<IHotelFeedbackEntity>(),
    collection: "feedbacks",
    selectId: feedback => feedback.id
  }
)

const roomTypeConfig = entityConfig({
	entity: type<IAdminRoomType>(),
	collection: "roomTypes",
	selectId: room => room.id
});

const foodTypeConfig = entityConfig({
	entity: type<IAdminFoodType>(),
	collection: "foodTypes",
	selectId: food => food.id
});

const hotelDetailsConfig = entityConfig({
  entity:type<IHotelDetailsEntity>(),
  collection: "hotelDetails",
  selectId: hotelDetails => hotelDetails.id
})
export const EntityStoragePr2 = signalStore(
	{ providedIn: "root" },

	withEntities(adminHotelConfig),
	withEntities(minCountryConfig),
	withEntities(roomTypeConfig),
	withEntities(foodTypeConfig),
  withEntities(hotelDetailsConfig),
  withEntities(hotelFeedbacksConfig),
	withMethods(store => ({
		setAdminHotel(adminHotel: IAdminHotelEntity): void {
			patchState(store, setEntity(adminHotel, adminHotelConfig));
		},
		setMinCountry(minCountry: IMinCountryEntity): void {
			patchState(store, setEntity(minCountry, minCountryConfig));
		},
		setRoomType(roomType: IAdminRoomType): void {
			patchState(store, setEntity(roomType, roomTypeConfig));
		},
		setFoodType(foodType: IAdminFoodType): void {
			patchState(store, setEntity(foodType, foodTypeConfig));
		},
    setHotelDetails(hotelDetails: IHotelDetailsEntity): void {
      patchState(store, setEntity(hotelDetails, hotelDetailsConfig));
    },

		setAllAdminHotels(adminHotels: IAdminHotelEntity[]): void {
			patchState(store, setAllEntities(adminHotels, adminHotelConfig));
		},
		setAllMinCountries(minCountries: IMinCountryEntity[]): void {
			patchState(store, setAllEntities(minCountries, minCountryConfig));
		},
		setAllRoomTypes(roomTypes: IAdminRoomType[]): void {
			patchState(store, setAllEntities(roomTypes, roomTypeConfig));
		},
		setAllFoodTypes(foodTypes: IAdminFoodType[]): void {
			patchState(store, setAllEntities(foodTypes, foodTypeConfig));
		},
    setAllHotelFeedbacks(hotels:IHotelFeedbackEntity[]): void {
      patchState(store, setAllEntities(hotels,hotelFeedbacksConfig));
    },
    removeAdminHotel(id: number): void {
      patchState(store, removeEntity(id, adminHotelConfig));
    },
    removeMinCountry(id: number): void {
      patchState(store, removeEntity(id, minCountryConfig));
    },
    removeRoomType(id: number): void {
      patchState(store, removeEntity(id, roomTypeConfig));
    },
    removeFoodType(id: number): void {
      patchState(store, removeEntity(id, foodTypeConfig));
    }
    })
  ));
