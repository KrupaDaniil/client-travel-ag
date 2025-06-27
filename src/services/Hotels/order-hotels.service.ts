import { Injectable } from "@angular/core";
import { ValidationService } from "../validation.service";
import { HttpService } from "../http.service";
import { firstValueFrom, map, Observable } from "rxjs";
import { IOrderHotels } from "../../interfaces/hotels-block/i-order-hotels";
import { IError } from "../../interfaces/i-error";

@Injectable({
	providedIn: "root"
})
export class OrderHotelsService {
	constructor(private http_s: HttpService, private check: ValidationService) {}

	async getAllOrderHotelsToUser(username: string): Promise<IOrderHotels[] | undefined> {
		return await firstValueFrom(
			this.http_s.loadingAllOrderHotelToUser(username).pipe(
				map((res: IOrderHotels[] | IError): IOrderHotels[] | undefined => {
					if (this.check.isError(res)) {
						return undefined;
					} else {
						return res as IOrderHotels[];
					}
				})
			)
		);
	}

	async getCanceledOrderHotel(id: number): Promise<IOrderHotels | undefined> {
		return await firstValueFrom(
			this.http_s.canceledOrderHotel(id).pipe(
				map((res: IOrderHotels | IError): IOrderHotels | undefined => {
					if (this.check.isError(res)) {
						return undefined;
					} else {
						return res as IOrderHotels;
					}
				})
			)
		);
	}
}
