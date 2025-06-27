import { patchState, signalStore, type, withMethods } from "@ngrx/signals";
import { entityConfig, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { IAdminHotelEntity } from "../interfaces/hotels-block/i-admin-hotel.entity";
import { IMinCountryEntity } from "../interfaces/country-block/i-min-country.entity";
import { IAdminRoomType } from "../interfaces/hotels-block/i-admin-room-type";
import { IAdminFoodType } from "../interfaces/hotels-block/i-admin-food-type";
import { IAdminTour } from "../interfaces/tour-block/i-admin-tour";
import { IHotelFeedbackEntity } from "../interfaces/hotels-block/i-hotel-feedback.entity";
import { IHotelDetailsEntity } from "../interfaces/hotels-block/i-hotel-details.entity";
import { IStatisticHotel } from "../interfaces/statistic-block/i-statistic-hotel";
import { IStatisticTour } from "../interfaces/statistic-block/i-statistic-tour";
import { IHotelRatesEntity } from "../interfaces/hotels-block/i-hotel-rates.entity";
import { ICardTour } from "../interfaces/tour-block/i-card-tour";
import { IMinCityEntity } from "../interfaces/country-block/i-min-city.entity";
import { IMinCityCountryEntity } from "../interfaces/country-block/i-min-city-country.entity";
import { IOrderTour } from "../interfaces/tour-block/i-order-tour";
import {ICityBookingEntity} from '../interfaces/country-block/i-city-booking.entity';

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

const hotelFeedbacksConfig = entityConfig({
	entity: type<IHotelFeedbackEntity>(),
	collection: "feedbacks",
	selectId: feedback => feedback.id
});

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

const adminTourConfig = entityConfig({
	entity: type<IAdminTour>(),
	collection: "adminTours",
	selectId: adminTour => adminTour.id
});

const hotelDetailsConfig = entityConfig({
	entity: type<IHotelDetailsEntity>(),
	collection: "hotelDetails",
	selectId: hotelDetails => hotelDetails.id
});

const hotelStatisticConfig = entityConfig({
	entity: type<IStatisticHotel>(),
	collection: "hotelStatistics",
	selectId: hotelSt => hotelSt.id
});

const tourStatisticConfig = entityConfig({
	entity: type<IStatisticTour>(),
	collection: "tourStatistics",
	selectId: tourSt => tourSt.id
});

const hotelRatesConfig = entityConfig({
	entity: type<IHotelRatesEntity>(),
	collection: "hotelRates",
	selectId: hotelRrates => hotelRrates.hotelId
});

const clientTourConfig = entityConfig({
	entity: type<ICardTour>(),
	collection: "clientTours",
	selectId: clientTour => clientTour.id
});

const minCityCountryConfig = entityConfig({
	entity: type<IMinCityCountryEntity>(),
	collection: "minCityCountry",
	selectId: minCity => minCity.cityId
});

const orderTourConfig = entityConfig({
	entity: type<IOrderTour>(),
	collection: "orderTours",
	selectId: orderTour => orderTour.id
});

const citiesBookingConfig = entityConfig({
  entity:type<ICityBookingEntity>(),
  collection: "citiesBookings",
  selectId: citiesBooking => citiesBooking.cityId
})

export const EntityStoragePr2 = signalStore(
	{ providedIn: "root" },

	withEntities(adminHotelConfig),
	withEntities(minCountryConfig),
	withEntities(roomTypeConfig),
	withEntities(foodTypeConfig),
	withEntities(adminTourConfig),
	withEntities(hotelDetailsConfig),
	withEntities(hotelFeedbacksConfig),
	withEntities(hotelStatisticConfig),
	withEntities(tourStatisticConfig),
	withEntities(hotelRatesConfig),
	withEntities(clientTourConfig),
	withEntities(minCityCountryConfig),
	withEntities(orderTourConfig),
  withEntities(citiesBookingConfig),

	withMethods(store => ({
		setAdminHotel(adminHotel: IAdminHotelEntity): void {
			patchState(store, setEntity(adminHotel, adminHotelConfig));
		},
    setAllCitiesBooking(cities: ICityBookingEntity[]): void {
      patchState(store, setAllEntities(cities, citiesBookingConfig));
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
		setAdminTour(adminTour: IAdminTour): void {
			patchState(store, setEntity(adminTour, adminTourConfig));
		},
		setHotelDetails(hotelDetails: IHotelDetailsEntity): void {
			patchState(store, setEntity(hotelDetails, hotelDetailsConfig));
		},
		setHotelBk(hotelSt: IStatisticHotel): void {
			patchState(store, setEntity(hotelSt, hotelStatisticConfig));
		},
		setTourBk(tourSt: IStatisticTour): void {
			patchState(store, setEntity(tourSt, tourStatisticConfig));
		},
		setHotelRate(rate: IHotelRatesEntity): void {
			patchState(store, setEntity(rate, hotelRatesConfig));
		},
		setClientTour(clientTour: ICardTour): void {
			patchState(store, setEntity(clientTour, clientTourConfig));
		},
		setOrderTour(orderTour: IOrderTour): void {
			patchState(store, setEntity(orderTour, orderTourConfig));
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
		setAllAdminTours(adminTours: IAdminTour[]): void {
			patchState(store, setAllEntities(adminTours, adminTourConfig));
		},
		setAllHotelFeedbacks(hotels: IHotelFeedbackEntity[]): void {
			patchState(store, setAllEntities(hotels, hotelFeedbacksConfig));
		},
		setAllHotelBooking(hotelBookings: IStatisticHotel[]): void {
			patchState(store, setAllEntities(hotelBookings, hotelStatisticConfig));
		},
		setAllTourBooking(tourBookings: IStatisticTour[]): void {
			patchState(store, setAllEntities(tourBookings, tourStatisticConfig));
		},
		setAllRates(rates: IHotelRatesEntity[]): void {
			patchState(store, setAllEntities(rates, hotelRatesConfig));
		},

		setAllClientTour(clientTours: ICardTour[]): void {
			patchState(store, setAllEntities(clientTours, clientTourConfig));
		},

		setAllMinCityCountries(cities: IMinCityCountryEntity[]): void {
			patchState(store, setAllEntities(cities, minCityCountryConfig));
		},
		setAllOrderTour(orderTours: IOrderTour[]): void {
			patchState(store, setAllEntities(orderTours, orderTourConfig));
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
		},
		removeAdminTour(id: number): void {
			patchState(store, removeEntity(id, adminTourConfig));
		},
		removeClientTour(id: number): void {
			patchState(store, removeEntity(id, clientTourConfig));
		}
	}))
);
