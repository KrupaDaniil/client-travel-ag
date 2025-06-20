import {IClimateEntity} from './i-climate.entity';
import {ILanguageEntity} from './i-language.entity';
import {ICountryCityEntity} from './i-country-city.entity';

export interface ICountryRequestUpdateEntity {
  id: number;
  name: string;
  currency: string;
  phoneCode: string;
  flagImage: File | undefined;
  defaultImage: File | undefined;
  description: string;
  climate: IClimateEntity;
  capitalCityName: ICountryCityEntity;
  languages: ILanguageEntity[];
}
