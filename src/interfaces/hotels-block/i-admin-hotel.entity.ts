import { IMinCityEntity } from "../country-block/i-min-city.entity";
import { IMinCountryEntity } from "../country-block/i-min-country.entity";
import { IMinUserEntity } from "../i-min-user.entity";
import { ITagEntity } from "./i-tag.entity";
import { IHotelImage } from "./IHotelImage.entity";

export interface IAdminHotelEntity {
	id: number;
	hotelName: string;
	rate: number;
	description: string;
	address: string;
	images: IHotelImage[];
	tags: ITagEntity[];
	country: IMinCountryEntity;
	city: IMinCityEntity;
	manager: IMinUserEntity;
}
