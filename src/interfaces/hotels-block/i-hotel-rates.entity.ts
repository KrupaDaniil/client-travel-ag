export interface IHotelRatesEntity {
  hotelId: number;

  locationRating:number;
  roomsRating:number;
  cleanRating:number;
  serviceRating :number;
  sleepRating :number;
  priceRating:number;

  ratesAmount:number[];
}
