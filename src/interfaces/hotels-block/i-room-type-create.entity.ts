import {IMinHotel} from './i-min-hotel';

export interface IRoomTypeCreateEntity {
  name: string;
  price: number;
  maxPeople: number;
  hotel: IMinHotel;
}
