import {IMinHotel} from '../hotels-block/i-min-hotel';

export interface IStatisticHotel {
  id: number;
  hotel: IMinHotel
  amount: number;
}
