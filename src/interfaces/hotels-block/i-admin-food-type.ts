import {IMinHotel} from './i-min-hotel';

export interface IAdminFoodType {
  id: number;
  name: string;
  price: number;
  hotel: IMinHotel
}
