import {IHotelImage} from './IHotelImage.entity';

export interface IHotelEntity {
  id : number;
  hotelName:string;
  rate:number;
  description:string;
  images:IHotelImage[];
}
