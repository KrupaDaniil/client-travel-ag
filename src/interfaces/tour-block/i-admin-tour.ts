import {IBlobImageEntity} from '../country-block/i-blob-image.entity';
import {IMinCountryEntity} from '../country-block/i-min-country.entity';
import {IMinCityEntity} from '../country-block/i-min-city.entity';
import {IMinHotel} from '../hotels-block/i-min-hotel';
import {IMinUser} from '../i-min-user';

export interface IAdminTour {
  id: number;
  name: string;
  description: string;
  price: number;
  dateStart: Date;
  dateEnd: Date;
  mainImageId: IBlobImageEntity;
  country: IMinCountryEntity;
  city: IMinCityEntity;
  hotel: IMinHotel;
  manager: IMinUser;
}
