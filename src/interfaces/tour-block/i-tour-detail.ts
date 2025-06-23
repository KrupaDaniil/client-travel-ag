import { IMinCityEntity } from "../country-block/i-min-city.entity";
import { IMinCountryTour } from "../country-block/i-min-country-tour";
import { IMinTourHotel } from "../hotels-block/i-min-tour-hotel";

export interface ITourDetail {
	id: number;
	name: string;
	description: string;
	price: number;
	dateStart: Date;
	dateEnd: Date;
	mainImage: string;
	country: IMinCountryTour;
	city: IMinCityEntity;
	hotel: IMinTourHotel;
}
