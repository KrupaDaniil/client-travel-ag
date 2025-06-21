export interface IAdventure {
      dateFrom:String;
      To:String;
      peopleAmount:number;

      hotelId:number;
      roomTypeId:number;
      foodTypeId:number;

      userId:number;

      customerName:number;
      customerSurname:number;
      customerPhone:number;

      status:AdventureStatus;
}

export enum AdventureStatus{
  CANCELED="Скасовано",
  BOOKED="Заброньовано",
  PAYED="Оплачено",
  FINISHED="Завершено"
}
