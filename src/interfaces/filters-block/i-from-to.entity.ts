import { IFTCityEntity } from "./i-f-t-city.entity";

export interface IFromToEntity {
	id: number;
	cityFrom: IFTCityEntity;
	citiesTo: IFTCityEntity[];
}
