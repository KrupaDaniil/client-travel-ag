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
import {LoadingComponent} from "../../loading/loading.component";
import {NgxPaginationModule} from "ngx-pagination";
import {EntityStorage} from "../../../storage/entity.storage";
import {HotToastService} from "@ngxpert/hot-toast";
import {OrderTourService} from "../../../services/order-tour.service";
import {IOrderTour} from "../../../interfaces/tour-block/i-order-tour";
import {IMinUser} from "../../../interfaces/i-min-user";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-reserved-tours',
    imports: [
        LoadingComponent,
        NgxPaginationModule,
        NgIf,
        NgOptimizedImage,
        ReactiveFormsModule
    ],
    templateUrl: './reserved-tours.component.html',
    styleUrl: './reserved-tours.component.css'
})
export class ReservedToursComponent implements OnInit {
    private readonly store = inject(EntityStorage);
    private readonly toast: HotToastService = inject(HotToastService);

    private orderedTours: Signal<IOrderTour[]> = computed((): IOrderTour[] => this.store.orderedToursEntities());
    protected displayOrderedTours: WritableSignal<IOrderTour[] | null> = signal<IOrderTour[] | null>(null);
    protected isLoading: WritableSignal<boolean> = signal<boolean>(false);

    private orderedBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
        viewChild<ElementRef<HTMLTableSectionElement>>("orderedToursBlock");
    private cnfBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
        viewChild<ElementRef<HTMLButtonElement>>("cnRsvBtn");

    protected searchDataForm: FormGroup | undefined;

    private _selectedOrderedTour: IOrderTour | undefined;
    private _searchDataList: IOrderTour[] | undefined;

    protected page: number;
    protected displaySize: number;
    private checkRp: Set<number>;
    private confLs: (() => void) | undefined;

    constructor(private orderTourService: OrderTourService, private render: Renderer2) {
        this.page = 1;
        this.displaySize = 13;
        this.checkRp = new Set<number>();
        this.initDisplayContent();
        this.initSelectedBlock();
    }

    ngOnInit(): void {
        this.orderTourService.getAllOrderedTours().then((r: boolean): void => {
            this.isLoading.set(r);
        });
        this.createSearchForm();
    }

    private initDisplayContent(): void {
        effect(() => {
            if (this.isLoading()) {
                this.displayOrderedTours.set(this.orderedTours());
            }
        });
    }

    private initSelectedBlock(): void {
        effect(() => {
            if (this.orderedBlock()) {
                this.selectTableRow();
            }
        });
    }

    private selectTableRow(): void {
        const orders: HTMLTableSectionElement | undefined = this.orderedBlock()?.nativeElement;

        if (orders) {
            this.render.listen(orders, "click", (e: Event) => {
                const t = e.target as HTMLElement;
                if (t.tagName.toLowerCase() === "td") {
                    const r = t.closest("tr") as HTMLTableRowElement;
                    if (r) {
                        const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
                        if (radio) {
                            this.render.setProperty(radio, "checked", true);
                        }

                        const orderId: number = Number.parseInt(r.dataset["orderId"] as string);

                        this.orderedTours()!.forEach((order: IOrderTour): void => {
                            if (order.id === orderId) {
                                this._selectedOrderedTour = order;
                                return;
                            }
                        });

                        if (this.confLs) {
                            this.confLs();
                        }

                        if (this._selectedOrderedTour) {
                            if (this.cnfBtn()?.nativeElement) {
                                this.confLs = this.render.listen(this.cnfBtn()!.nativeElement, "click", () => {
                                    if (this._selectedOrderedTour?.canceled) {
                                        this.toast.warning("Already canceled", this.getParamTs())
                                    } else {
                                        if (this._selectedOrderedTour?.id) {
                                            this.confirmRsvTour(this._selectedOrderedTour?.id);
                                            this._selectedOrderedTour = undefined;
                                            this.render.setProperty(orders, "checked", false);
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

    private confirmRsvTour(id: number): void {
        if (this.checkRp.has(id)) {
            return;
        }

        this.orderTourService.reservationCmTour(id).then((r: IOrderTour | undefined): void => {
            let isUpdate: boolean = false;
            if (r) {
                this.displayOrderedTours.update((cl: IOrderTour[] | null): IOrderTour[] | null => {
                    if (cl) {
                        const index: number = cl.findIndex((h: IOrderTour) => h.id === id);
                        if (index !== -1) {
                            const update: IOrderTour[] = [...cl];
                            update[index] = r;
                            isUpdate = true;
                            return update;
                        }
                    } else {
                        isUpdate = false;
                    }

                    return cl;
                });
            } else {
                isUpdate = false;
            }

            if (isUpdate) {
                this.toast.success("Confirmed", this.getParamTs());
                this.checkRp.add(id);
            } else {
                this.toast.error("Not confirmed", this.getParamTs())
            }
        });
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
                    this._searchDataList = this.orderedTours().filter((tour: IOrderTour) =>
                        tour.client.username.toLowerCase().includes(text.toLowerCase())
                    );
                }

                if (opt === "tour_name") {
                    this._searchDataList = this.orderedTours().filter((tour: IOrderTour) =>
                        tour.tour.name.toLowerCase().includes(text.toLowerCase())
                    );
                }

                if (this._searchDataList && this._searchDataList.length > 0) {
                    this.displayOrderedTours.set(this._searchDataList);
                }
            }
        }

    }

    protected clearSearch(): void {
        this.searchDataForm?.reset();
        this._searchDataList = undefined;
        this.displayOrderedTours.set(this.orderedTours());
    }

}
