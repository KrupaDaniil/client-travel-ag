import {IHotelEntity} from './i-hotel.entity';
import {IHotelFeedbackEntity} from './i-hotel-feedback.entity';
import {ITagEntity} from './i-tag.entity';

export interface IHotelDetailsEntity extends IHotelEntity {
  feedbacks:IHotelFeedbackEntity[];
  tags:ITagEntity[];
}
