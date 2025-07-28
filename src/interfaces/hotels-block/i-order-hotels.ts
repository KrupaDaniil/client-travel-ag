import {IMinBookingHotel} from "./i-min-booking-hotel";
import {IMinUser} from "../i-min-user";

export interface IOrderHotels {
    id: number;
    dateFrom: Date;
    dateTo: Date;
    fullPrice: number;
    peopleAmount: number;
    roomTypeName: string;
    foodTypeName: string;
    hotel: IMinBookingHotel;
    status: number;
    orderProcessed: Boolean;
    client: IMinUser;
}
