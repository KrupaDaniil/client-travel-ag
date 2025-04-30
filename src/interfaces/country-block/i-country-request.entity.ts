import {IClimateEntity} from './i-climate.entity';
import {ICityEntity} from './i-city.entity';
import {ILanguageEntity} from './i-language.entity';

export interface ICountryRequestEntity {
  name: string;
  currency: string;
  phoneCode: string;
  flagImage: File | undefined;
  description: string;
  climate: IClimateEntity;
  capitalCity: ICityEntity;
  languages: ILanguageEntity[];
}
