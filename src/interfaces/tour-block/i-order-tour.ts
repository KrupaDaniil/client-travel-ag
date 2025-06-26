import { IMinTour } from "./i-min-tour";

export interface IOrderTour {
	id: number;
	startDate: Date;
	endDate: Date;
	price: number;
	canceled: boolean;
	tour: IMinTour;
}
