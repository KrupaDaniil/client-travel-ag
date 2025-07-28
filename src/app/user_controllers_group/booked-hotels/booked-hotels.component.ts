import {Component, inject, OnInit, signal, WritableSignal} from "@angular/core";
import {EntityStorage} from "../../../storage/entity.storage";
import {IOrderHotels} from "../../../interfaces/hotels-block/i-order-hotels";
import {OrderHotelsService} from "../../../services/Hotels/order-hotels.service";
import {Router} from "@angular/router";
import {LocalConstants} from "../../enums/local-constants";
import {CreateHotToastRef, HotToastService} from "@ngxpert/hot-toast";
import {LoadingComponent} from "../../loading/loading.component";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {AdventureStatus} from "../../enums/adventure-status";
import {BarRating} from "ngx-bar-rating";
import {StatisticService} from "../../../services/statistic.service";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
    selector: "app-booked-hotels",
    imports: [LoadingComponent, CommonModule, NgOptimizedImage, BarRating, NgxPaginationModule],
    providers: [OrderHotelsService, StatisticService],
    templateUrl: "./booked-hotels.component.html",
    styleUrl: "./booked-hotels.component.css",
    standalone: true
})
export class BookedHotelsComponent implements OnInit {
    private readonly store = inject(EntityStorage);
    private readonly toast: HotToastService = inject(HotToastService);
    private readonly username: string;
    private timerId: number | undefined;
    protected hotelsList: WritableSignal<IOrderHotels[] | null> = signal<IOrderHotels[] | null>(null);
    protected isLoadingFailed: WritableSignal<boolean> = signal<boolean>(false);
    protected stCanceled: number;
    protected page: number;
    protected itemsCount: number;

    constructor(private orderService: OrderHotelsService, private router: Router, private st: StatisticService) {
        this.username = this.store.username();
        this.stCanceled = AdventureStatus.CANCELED;
        this.page = 1;
        this.itemsCount = 5;
    }

    ngOnInit(): void {
        this.checkUser();
        this.setOrderHotels();
    }

    private checkUser(): void {
        if (this.username === "") {
            localStorage.setItem(LocalConstants.L_URL, this.router.url);
            this.router.navigate(["/authorization"]).then();
        }
    }

    private setOrderHotels(): void {
        this.timerId = window.setTimeout(() => {
            this.isLoadingFailed.set(true);
        }, 30000);

        this.orderService.getAllOrderHotelsToUser(this.username).then((r: IOrderHotels[] | undefined): void => {
            if (r) {
                this.hotelsList.set(r);
                this.isLoadingFailed.set(false);
                if (this.timerId) {
                    window.clearTimeout(this.timerId);
                    this.timerId = undefined;
                }
            }
        });
    }

    protected cancelOrder(event: Event): void {
        const element = event.target as HTMLButtonElement;

        if (element) {
            const id: string | undefined = element.dataset["orderId"];

            if (id) {
                const ref: CreateHotToastRef<unknown> = this.toast.loading("Обробка...", this.tsObj());
                const rId: number = Number.parseInt(id);

                this.orderService.getCanceledOrderHotel(rId).then((r: IOrderHotels | undefined): void => {
                    if (r) {
                        this.hotelsList.update((or: IOrderHotels[] | null): IOrderHotels[] | null => {
                            ref.close();
                            if (or !== null) {
                                const index: number = or.findIndex((orh: IOrderHotels): boolean => orh.id === rId);
                                if (index !== -1) {
                                    or[index] = r;
                                    this.toast.success("Бронювання скасовано", this.tsObj());
                                    this.st.countHBDown(r.hotel.id);
                                } else {
                                    this.toast.error("Помилка скасування", this.tsObj());
                                }
                            }
                            return or;
                        });
                    } else {
                        ref.close();
                        this.toast.error("Помилка скасування", this.tsObj());
                    }
                });
            }
        }
    }

    protected convertDate(date: string | Date): string {
        const dt: Date = new Date(date);
        const month: string = (dt.getMonth() + 1).toString().padStart(2, "0");

        return `${dt.getDate().toString().padStart(2, "0")}.${month}.${dt.getFullYear()}`;
    }

    private tsObj(): Object {
        return {
            theme: "snackbar",
            duration: 5000,
            position: "bottom-center",
            autoClose: true,
            dismissible: true,
            style: {
                "border-radius": "30px"
            }
        };
    }
}
