import {IMinHotel} from './i-min-hotel';

export interface IAdminRoomType {
  id: number;
  name: string;
  price: number;
  maxPeople: number;
  hotel: IMinHotel
}
