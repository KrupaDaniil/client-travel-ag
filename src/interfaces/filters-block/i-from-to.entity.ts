import { IFTCityEntity } from "./i-f-t-city.entity";

export interface IFromToEntity {
	id: string;
	cityFrom: IFTCityEntity;
	citiesTo: IFTCityEntity[];
}
