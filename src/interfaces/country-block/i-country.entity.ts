import {IBlobImageEntity} from './i-blob-image.entity';
import {ICityEntity} from './i-city.entity';
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
  capitalCityName: ICityEntity;
  languages: ILanguageEntity[];
}
