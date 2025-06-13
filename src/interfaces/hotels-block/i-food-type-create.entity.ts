import {IMinHotel} from './i-min-hotel';

export interface IFoodTypeCreateEntity {
  name: string;
  price: number;
  hotel: IMinHotel;
}
