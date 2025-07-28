import {
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    OnInit,
    Renderer2,
    signal,
    Signal,
    viewChild,
    WritableSignal
} from '@angular/core';
import {EntityStorage} from "../../../storage/entity.storage";
import {HotToastService} from "@ngxpert/hot-toast";
import {IOrderHotels} from "../../../interfaces/hotels-block/i-order-hotels";
import {OrderHotelsService} from "../../../services/Hotels/order-hotels.service";
import {NgxPaginationModule} from "ngx-pagination";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {LoadingComponent} from "../../loading/loading.component";
import {AdventureStatus} from "../../enums/adventure-status";
import {IMinUser} from "../../../interfaces/i-min-user";
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-reserved-hotels',
    imports: [
        NgxPaginationModule,
        ReactiveFormsModule,
        LoadingComponent,
        NgIf,
        NgOptimizedImage
    ],
    providers: [
        OrderHotelsService
    ],
    templateUrl: './reserved-hotels.component.html',
    styleUrl: './reserved-hotels.component.css'
})
export class ReservedHotelsComponent implements OnInit {
    private readonly store = inject(EntityStorage);
    private readonly toast: HotToastService = inject(HotToastService);

    private readonly orderedHotels: Signal<IOrderHotels[]> = computed((): IOrderHotels[] => this.store.orderHotelsEntities());

    protected displayOrderHotels: WritableSignal<IOrderHotels[] | null> = signal<IOrderHotels[] | null>(null);
    protected isLoading: WritableSignal<boolean> = signal<boolean>(false);

    protected page: number;
    protected displaySize: number;
    private _selectedOrderHotel: IOrderHotels | undefined;
    private _searchDataList: IOrderHotels[] | undefined;
    protected readonly AdventureStatus = AdventureStatus;
    private cnfLs: (() => void) | undefined;

    private orderHotelsBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
        viewChild<ElementRef<HTMLTableSectionElement>>("orderHotelsBlock");
    private cnfBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
        viewChild<ElementRef<HTMLButtonElement>>("cnRsvBtn");
    protected searchDataForm: FormGroup | undefined;

    constructor(private orderHotelsService: OrderHotelsService, private render: Renderer2) {
        this.setDisplayOrders();
        this.page = 1;
        this.displaySize = 13;
        this.initSelectedOrderHotels();
    }

    ngOnInit(): void {
        this.orderHotelsService.getAllOrderedHotels().then((r: boolean): void => {
            if (!r) {
                this.isLoading.set(r);
            }
        });
        this.createSearchForm();
    }

    private setDisplayOrders(): void {
        effect(() => {
            if (this.isLoading()) {
                this.displayOrderHotels.set(this.orderedHotels());
            }
        });
    }

    private initSelectedOrderHotels(): void {
        effect(() => {
            if (this.orderHotelsBlock()) {
                this.selectTableRow();
            }
        });
    }

    private selectTableRow(): void {
        if (this.orderHotelsBlock()?.nativeElement) {
            this.render.listen(this.orderHotelsBlock()!.nativeElement, "click", (e: Event) => {
                const t = e.target as HTMLElement;
                if (t.tagName.toLowerCase() === "td") {
                    const r = t.closest("tr") as HTMLTableRowElement;
                    if (r) {
                        const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
                        if (radio) {
                            this.render.setProperty(radio, "checked", true);
                        }

                        const orderId: number = Number.parseInt(r.dataset["orderId"] as string);

                        this.orderedHotels()!.forEach((order: IOrderHotels): void => {
                            if (order.id === orderId) {
                                this._selectedOrderHotel = order;
                                return;
                            }
                        });

                        if (this.cnfLs) {
                            this.cnfLs();
                        }

                        if (this._selectedOrderHotel) {
                            if (this.cnfBtn()?.nativeElement) {
                                this.cnfLs = this.render.listen(this.cnfBtn()!.nativeElement, "click", () => {
                                    if (this._selectedOrderHotel?.status === AdventureStatus.CANCELED) {
                                        this.toast.warning("Already canceled", this.getParamTs())
                                    } else {
                                        if (this._selectedOrderHotel?.id) {
                                            this.confirmRsvHotel(this._selectedOrderHotel.id)
                                            this._selectedOrderHotel = undefined;
                                            this.render.setProperty(this.orderHotelsBlock()!.nativeElement, "checked", false);
                                        }
                                    }

                                });
                            }
                        }
                    }
                }
            });
        }

    }

    protected convertDate(date_1: string | Date, date_2: string | Date): string {
        const dt_1: Date = new Date(date_1);
        const dt_2: Date = new Date(date_2);

        const month_dt_1: string = (dt_1.getMonth() + 1).toString().padStart(2, "0");
        const month_dt_2: string = (dt_2.getMonth() + 1).toString().padStart(2, "0");

        return `${dt_1.getDate().toString().padStart(2, "0")}.${month_dt_1}.${dt_1.getFullYear()} - ` +
            `${dt_2.getDate().toString().padStart(2, "0")}.${month_dt_2}.${dt_2.getFullYear()}`;
    }

    protected convertUser(user: IMinUser): string {
        if (user) {
            return `${user.firstName} ${user.lastName}`;
        } else {
            return "-"
        }

    }

    private confirmRsvHotel(id: number): void {
        this.orderHotelsService.getReservationCmHotel(id).then((r: IOrderHotels | undefined): void => {

            if (r) {
                this.displayOrderHotels.update((cl: IOrderHotels[] | null): IOrderHotels[] | null => {
                    if (cl) {
                        const index: number = cl.findIndex((h: IOrderHotels) => h.id === id);
                        if (index !== -1) {
                            const update: IOrderHotels[] = [...cl]
                            update[index] = r
                            this.toast.success("Confirmed", this.getParamTs())
                            return update;
                        }
                    } else {
                        this.toast.error("Not confirmed", this.getParamTs())
                    }

                    return cl;
                });
            } else {
                this.toast.error("Not confirmed", this.getParamTs())
            }
        });
    }

    private getParamTs(): Object {
        return {
            position: "bottom-center",
            autoClose: true,
            duration: 3500,
            theme: "snackbar",
            dismissible: true,
            style: {
                "border-radius": "30px",
            }
        }
    }

    private createSearchForm(): void {
        this.searchDataForm = new FormGroup({
            search_text: new FormControl(""),
            search_option: new FormControl("")
        });
    }

    protected searchTour(): void {
        const formValue = this.searchDataForm?.value;

        console.log(this.searchDataForm?.value);

        if (formValue && formValue.search_text && formValue.search_option) {
            const opt: string = formValue.search_option;
            const text: string = formValue.search_text;

            if (text.trim() !== "") {
                if (opt === "username") {
                    this._searchDataList = this.orderedHotels().filter((hotel: IOrderHotels) =>
                        hotel.client.username.toLowerCase().includes(text.toLowerCase())
                    );
                }

                if (opt === "hotel_name") {
                    this._searchDataList = this.orderedHotels().filter((hotel: IOrderHotels) =>
                        hotel.hotel.hotelName.toLowerCase().includes(text.toLowerCase())
                    );
                }

                if (this._searchDataList && this._searchDataList.length > 0) {
                    this.displayOrderHotels.set(this._searchDataList);
                }
            }
        }

    }

    protected clearSearch(): void {
        this.searchDataForm?.reset();
        this._searchDataList = undefined;
        this.displayOrderHotels.set(this.orderedHotels());
    }
}
