import {IMinTour} from "./i-min-tour";
import {IMinUser} from "../i-min-user";

export interface IOrderTour {
    id: number;
    startDate: Date;
    endDate: Date;
    price: number;
    canceled: boolean;
    tour: IMinTour;
    client: IMinUser;
    orderProcessed: Boolean;
}
