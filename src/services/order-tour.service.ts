import {inject, Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {ValidationService} from "./validation.service";
import {MessageService} from "./message.service";
import {firstValueFrom, map} from "rxjs";
import {IOrderTour} from "../interfaces/tour-block/i-order-tour";
import {IError} from "../interfaces/i-error";
import {ICreateOrderTour} from "../interfaces/tour-block/i-create-order-tour";
import {EntityStorage} from "../storage/entity.storage";

@Injectable({
    providedIn: "root"
})
export class OrderTourService {
    private readonly store = inject(EntityStorage);

    constructor(private http_s: HttpService, private check: ValidationService, private message: MessageService) {
    }

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

    async getAllOrderedTours(): Promise<boolean> {
        return await firstValueFrom(
            this.http_s.loadingAllOrderedToursToManager().pipe(
                map((item: IOrderTour[] | IError): boolean => {
                    if (this.check.isError(item)) {
                        return false;
                    } else {
                        this.store.setAllRvnTours(item as IOrderTour[])
                        return true;
                    }
                })
            )
        )
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
                        this.store.setRvnTour(item as IOrderTour);
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
                        this.store.setRvnTour(item as IOrderTour);
                        return item as IOrderTour;
                    }
                })
            )
        );
    }

    async reservationCmTour(id: number): Promise<IOrderTour | undefined> {
        return await firstValueFrom(
            this.http_s.tourOrderConfirmation(id).pipe(
                map((item: IOrderTour | IError): IOrderTour | undefined => {
                    if (this.check.isError(item)) {
                        return undefined;
                    } else {
                        this.store.setRvnTour(item as IOrderTour);
                        return item as IOrderTour;
                    }
                })
            )
        )
    }
}
