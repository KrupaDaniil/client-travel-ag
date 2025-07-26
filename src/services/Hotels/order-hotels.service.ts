import {inject, Injectable} from "@angular/core";
import {ValidationService} from "../validation.service";
import {HttpService} from "../http.service";
import {firstValueFrom, map} from "rxjs";
import {IOrderHotels} from "../../interfaces/hotels-block/i-order-hotels";
import {IError} from "../../interfaces/i-error";
import {EntityStorage} from "../../storage/entity.storage";

@Injectable({
    providedIn: "root"
})
export class OrderHotelsService {
    private readonly store = inject(EntityStorage);

    constructor(private http_s: HttpService, private check: ValidationService) {
    }

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

    async getAllOrderedHotels(): Promise<boolean> {
        return await firstValueFrom(
            this.http_s.loadingAllOrderedHotelsToManager().pipe(
                map((res: IOrderHotels[] | IError): boolean => {
                    if (this.check.isError(res)) {
                        return false;
                    } else {
                        this.store.setAllRvnHotels(res as IOrderHotels[]);
                        return true;
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
                        this.store.setRvnHotel(res as IOrderHotels);
                        return res as IOrderHotels;
                    }
                })
            )
        );
    }

    async getReservationCmHotel(id: number): Promise<IOrderHotels | undefined> {
        return await firstValueFrom(
            this.http_s.hotelOrderConfirmation(id).pipe(
                map((res: IOrderHotels | IError): IOrderHotels | undefined => {
                    if (this.check.isError(res)) {
                        return undefined;
                    } else {
                        this.store.setRvnHotel(res as IOrderHotels);
                        return res as IOrderHotels;
                    }
                })
            )
        );
    }
}
