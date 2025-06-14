export interface IHotelFeedbackEntity {
  id:number;
  date:string;
  text:string;
  hotelId:number;
  userId:number;

  cleanRating:number;
  locationRating:number;
  priceRating:number;
  roomsRating:number;
  serviceRating:number;
  sleepRating:number;

  totalRating:number;

}
