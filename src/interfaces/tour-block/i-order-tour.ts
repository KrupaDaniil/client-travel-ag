import { IMinTour } from "./i-min-tour";

export interface IOrderTour {
	id: number;
	startDate: Date;
	endDate: Date;
	price: number;
	isCanceled: boolean;
	tour: IMinTour;
}
