import { IMinBookingHotel } from "./i-min-booking-hotel";

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
}
