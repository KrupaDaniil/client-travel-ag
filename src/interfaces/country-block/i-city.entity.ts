import { ICountryEntity } from './i-country.entity';

export interface ICityEntity {
  id: number;
  name: string;
  country: ICountryEntity;
}
