import { IMinCityEntity } from "../country-block/i-min-city.entity";
import { IMinCountryEntity } from "../country-block/i-min-country.entity";
import { IMinUser } from "../i-min-user";
import { ITagEntity } from "./i-tag.entity";
import { IHotelImage } from "./IHotelImage.entity";

export interface IAdminHotelEntity {
	id: number;
	hotelName: string;
	rate: number;
	description: string;
  images: IHotelImage[];
	address: string;

	tags: ITagEntity[];
	country: IMinCountryEntity;
	city: IMinCityEntity;
	manager: IMinUser;

  feedbacksAmount: number;
}
