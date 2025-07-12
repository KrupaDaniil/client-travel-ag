import {Component, computed, effect, inject, OnInit, signal, Signal, WritableSignal} from "@angular/core";
import {LoadingComponent} from "../../loading/loading.component";
import {ICardTour} from "../../../interfaces/tour-block/i-card-tour";
import {EntityStoragePr2} from "../../../storage/entity.storage.pr2";
import {TourService} from "../../../services/tour.service";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
    selector: "app-main-tours",
    imports: [LoadingComponent, ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, NgxPaginationModule],
    providers: [TourService],
    templateUrl: "./main-tours.component.html",
    styleUrl: "./main-tours.component.css"
})
export class MainToursComponent implements OnInit {
    private readonly store = inject(EntityStoragePr2);
    protected allTours: Signal<ICardTour[]> = computed((): ICardTour[] => this.store.clientToursEntities());
    protected displayTours: WritableSignal<ICardTour[] | null> = signal<ICardTour[] | null>(null);
    protected isLoadingData: WritableSignal<boolean> = signal<boolean>(false);
    protected minPrice: number | undefined;
    protected maxPrice: number | undefined;
    protected itemsCount: number;
    protected page: number;

    protected searchForm: FormGroup | undefined;

    constructor(private tourService: TourService) {
        this.isLoadingStatus();
        this.itemsCount = 6;
        this.page = 1;
    }

    ngOnInit(): void {
        this.createSearchForm();
    }

    private isLoadingStatus(): void {
        effect(() => {
            this.tourService.setAllClientTour().then((): void => {
                this.displayTours.set(this.allTours());
                this.isLoadingData.set(true);
                this.setMinMaxValue();
            });
        });
    }

    private createSearchForm(): void {
        this.searchForm = new FormGroup({
            tourName: new FormControl(""),
            minPrice: new FormControl<number | null>(null),
            maxPrice: new FormControl<number | null>(null)
        });
    }

    protected searchData(): void {
        if (this.searchForm) {
            const values = this.searchForm.value;
            const tourName: string = values.tourName as string;
            const minPrice: number = values.minPrice as number;
            const maxPrice: number = values.maxPrice as number;

            let tmpArr: ICardTour[] = [];
            let globalArr: ICardTour[] = [];

            if (values) {
                if (tourName.trim() !== "") {
                    tmpArr = this.allTours().filter((t: ICardTour): boolean =>
                        t.name.toLowerCase().includes(tourName.toLowerCase())
                    );
                }

                if (tmpArr.length > 0) {
                    for (const tN of tmpArr) {
                        globalArr.push(tN);
                    }
                    tmpArr = [];
                }

                console.log(globalArr);

                if (this.minPrice && this.maxPrice) {
                    if (minPrice > this.minPrice && maxPrice === this.maxPrice) {
                        tmpArr = this.allTours().filter((t: ICardTour): boolean => t.price >= minPrice);
                    }

                    if (minPrice === this.minPrice && maxPrice < this.maxPrice) {
                        tmpArr = this.allTours().filter((t: ICardTour): boolean => t.price <= maxPrice);
                    }

                    if (minPrice > this.minPrice && maxPrice < this.maxPrice) {
                        tmpArr = this.allTours().filter((t: ICardTour): boolean => t.price >= minPrice && t.price <= maxPrice);
                    }

                    if (minPrice === this.maxPrice) {
                        tmpArr = this.allTours().filter((t: ICardTour): boolean => t.price === maxPrice);
                    }

                    if (tmpArr.length > 0) {
                        for (const tP of tmpArr) {
                            globalArr.push(tP);
                        }
                        tmpArr = [];
                    }
                }

                if (globalArr.length > 0) {
                    console.log(globalArr);
                    this.displayTours.set(globalArr);
                }
            }
        }
    }

    protected clearSearch(): void {
        if (this.searchForm) {
            this.displayTours.set(this.allTours());
            this.searchForm.get("tourName")!.setValue("");
            this.setMinMaxValue();
        }
    }

    protected convertDate(date: string | Date): string {
        const currentDate: Date = new Date(date);
        const month: string = (currentDate.getMonth() + 1).toString().padStart(2, "0");

        return `${currentDate.getDate().toString().padStart(2, "0")}.${month}.${currentDate.getFullYear()}`;
    }

    private setMinMaxValue(): void {
        const price: number[] = this.allTours().map((t: ICardTour): number => t.price);
        this.minPrice = Math.min(...price);
        this.maxPrice = Math.max(...price);

        if (this.minPrice && this.maxPrice && this.minPrice >= 0 && this.maxPrice > 0) {
            if (this.searchForm && this.searchForm.get("minPrice") && this.searchForm.get("maxPrice")) {
                this.searchForm.get("minPrice")!.setValue(this.minPrice);
                this.searchForm.get("maxPrice")!.setValue(this.maxPrice);
            }
        }
    }
}
