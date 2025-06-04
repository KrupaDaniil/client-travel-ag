import {IBlobImageEntity} from './i-blob-image.entity';
import {ICountryCityEntity} from './i-country-city.entity';
import {IClimateEntity} from './i-climate.entity';
import {ILanguageEntity} from './i-language.entity';

export interface ICountryEntity {
  id: number;
  name: string;
  currency: string;
  phoneCode: string;
  flagImage: IBlobImageEntity;
  description: string;
  climate: IClimateEntity;
  capitalCity: ICountryCityEntity;
  languages: ILanguageEntity[];
  hotelsAmount:number;
}
