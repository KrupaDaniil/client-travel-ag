import { IMainCountryForCityEntity } from "../country-block/i-main-country-for-city.entity";

export interface IFTCityEntity {
	id: number;
	name: string;
	country: IMainCountryForCityEntity;
}
