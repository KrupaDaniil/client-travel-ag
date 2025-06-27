import {IHotelEntity} from './i-hotel.entity';
import {IHotelFeedbackEntity} from './i-hotel-feedback.entity';
import {ITagEntity} from './i-tag.entity';
import {IAdminFoodType} from './i-admin-food-type';
import {IAdminRoomType} from './i-admin-room-type';

export interface IHotelDetailsEntity extends IHotelEntity {
  feedbacks:IHotelFeedbackEntity[];
  tags:ITagEntity[];
  totalFeedbacks:number;

  foodTypes:IAdminFoodType[];
  roomTypes:IAdminRoomType[];



}
