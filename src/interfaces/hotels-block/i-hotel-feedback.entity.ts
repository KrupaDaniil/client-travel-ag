export interface IHotelFeedbackEntity {
  id:number;
  date:string;
  title:string;
  text:string;
  hotelId:number;
  username:number;

  cleanRating:number;
  locationRating:number;
  priceRating:number;
  roomsRating:number;
  serviceRating:number;
  sleepRating:number;

  totalRating:number;

}
