import { ICountryCityEntity } from "../country-block/i-country-city.entity";

export interface IFromCountryEntity {
	id: number;
	name: string;
	cities: ICountryCityEntity[];
}
