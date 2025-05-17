import { ICountryCityEntity } from "../interfaces/country-block/i-country-city.entity";

export class CountryCityEntity implements ICountryCityEntity {
	id: number;
	name: string;

	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}
}
