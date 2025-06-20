import {IClimateEntity} from './i-climate.entity';
import {ILanguageEntity} from './i-language.entity';

export interface ICountryRequestEntity {
  name: string;
  currency: string;
  phoneCode: string;
  flagImage: File | undefined;
  defaultImage: File | undefined;
  description: string;
  climate: IClimateEntity;
  capitalCityName: string;
  languages: ILanguageEntity[];
}
