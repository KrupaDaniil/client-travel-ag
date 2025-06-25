import { inject, Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { ValidationService } from "./validation.service";
import { MessageService } from "./message.service";
import { EntityStorage } from "../storage/entity.storage";
import { firstValueFrom, map, Observable } from "rxjs";
import { IOrderTour } from "../interfaces/tour-block/i-order-tour";
import { IError } from "../interfaces/i-error";
import { ICreateOrderTour } from "../interfaces/tour-block/i-create-order-tour";

@Injectable({
	providedIn: "root"
})
export class OrderTourService {
	constructor(private http_s: HttpService, private check: ValidationService, private message: MessageService) {}

	async getAllOrderTours(username: string): Promise<IOrderTour[] | undefined> {
		return await firstValueFrom(
			this.http_s.loadingAllOrderTourToUser(username).pipe(
				map((item: IOrderTour[] | IError): IOrderTour[] | undefined => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return undefined;
					} else {
						this.message.setMessage(null);
						return item as IOrderTour[];
					}
				})
			)
		);
	}

	async addOrderTour(newOrder: ICreateOrderTour): Promise<IOrderTour | undefined> {
		return await firstValueFrom(
			this.http_s.createOrderTour(newOrder).pipe(
				map((item: IOrderTour | IError): IOrderTour | undefined => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return undefined;
					} else {
						this.message.setMessage(null);
						return item as IOrderTour;
					}
				})
			)
		);
	}

	async canceledOrderTour(tourId: number): Promise<IOrderTour | undefined> {
		return await firstValueFrom(
			this.http_s.canceledOrderTour(tourId).pipe(
				map((item: IOrderTour | IError): IOrderTour | undefined => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return undefined;
					} else {
						this.message.setMessage(null);
						return item as IOrderTour;
					}
				})
			)
		);
	}
}
