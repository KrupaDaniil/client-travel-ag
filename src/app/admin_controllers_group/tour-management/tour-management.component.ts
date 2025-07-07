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
} from "@angular/core";
import {EntityStoragePr2} from "../../../storage/entity.storage.pr2";
import {HotToastService} from "@ngxpert/hot-toast";
import {TourService} from "../../../services/tour.service";
import {MessageService} from "../../../services/message.service";
import {IAdminTour} from "../../../interfaces/tour-block/i-admin-tour";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IMinCountryEntity} from "../../../interfaces/country-block/i-min-country.entity";
import {IMinCityEntity} from "../../../interfaces/country-block/i-min-city.entity";
import {IMinHotel} from "../../../interfaces/hotels-block/i-min-hotel";
import {IMinUser} from "../../../interfaces/i-min-user";
import {IDisplayMinUserEntity} from "../../../interfaces/tour-block/i-display-min-user.entity";
import {EntityStorage} from "../../../storage/entity.storage";
import {CommonModule, DatePipe, NgOptimizedImage} from "@angular/common";
import {OwlDateTimeModule} from "@danielmoncada/angular-datetime-picker";
import {NgSelectComponent} from "@ng-select/ng-select";
import {UserRoles} from "../../enums/user-roles";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
    selector: "app-tour-management",
    imports: [ReactiveFormsModule, OwlDateTimeModule, NgSelectComponent, CommonModule, NgOptimizedImage, NgxPaginationModule],
    providers: [TourService, MessageService, DatePipe],
    templateUrl: "./tour-management.component.html",
    styleUrl: "./tour-management.component.css"
})
export class TourManagementComponent implements OnInit {
    private readonly store = inject(EntityStorage);
    private readonly storePr2 = inject(EntityStoragePr2);
    private toast: HotToastService = inject(HotToastService);

    private tourList: Signal<IAdminTour[]> = computed((): IAdminTour[] => this.storePr2.adminToursEntities());
    protected displayList: WritableSignal<IAdminTour[] | null> = signal<IAdminTour[] | null>(null);
    private localMessages: Signal<string | null> = computed((): string | null => this.massage.message());
    protected localCountyList: WritableSignal<IMinCountryEntity[] | null> = signal<IMinCountryEntity[] | null>(null);
    protected localCityLis: WritableSignal<IMinCityEntity[] | null> = signal<IMinCityEntity[] | null>(null);
    protected localHotelList: WritableSignal<IMinHotel[] | null> = signal<IMinHotel[] | null>(null);
    protected localManagerList: WritableSignal<IDisplayMinUserEntity[] | null> = signal<IDisplayMinUserEntity[] | null>(
        null
    );

    private isSelectedRow: boolean;
    protected selectedId: number | undefined;
    private isAdmin: boolean;
    private isManager: boolean;
    private timerId: number | undefined;
    protected itemsCount: number;
    protected page: number;
    protected isLoadingFailed: WritableSignal<boolean> = signal<boolean>(false);
    protected isLoadingCity: WritableSignal<boolean> = signal<boolean>(false);
    protected isLoadingHotel: WritableSignal<boolean> = signal<boolean>(false);
    protected selectedTour: IAdminTour | undefined;

    protected addTourForm: FormGroup | undefined;
    protected editTourForm: FormGroup | undefined;
    protected searchDataForm: FormGroup | undefined;
    protected mainImageTour: File | undefined;

    private addModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
        viewChild<ElementRef<HTMLDialogElement>>("addTourDialog");
    private editModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
        viewChild<ElementRef<HTMLDialogElement>>("editTourDialog");
    private descriptionModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
        viewChild<ElementRef<HTMLDialogElement>>("descriptionTourDialog");
    private imageModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
        viewChild<ElementRef<HTMLDialogElement>>("imageTourDialog");
    private removeBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
        viewChild<ElementRef<HTMLButtonElement>>("removeTourBtn");
    private tourBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
        viewChild<ElementRef<HTMLTableSectionElement>>("tourBlock");

    constructor(
        private tourService: TourService,
        private massage: MessageService,
        private render: Renderer2,
    ) {
        this.itemsCount = 10;
        this.page = 1;
        this.isSelectedRow = false;
        this.isAdmin = false;
        this.isManager = false;
        this.addItemsToDisplayList();
        this.showMessage();
    }

    ngOnInit(): void {
        this.loadingTours();
        this.onSelectedRow();
        this.initLocalLists();
        this.createSearchForm();
        this.createAddForm();
        this.checkRoles();
    }

    private loadingTours(): void {
        if (this.tourList().length === 0) {
            this.tourService.setAllAdminTour();
        }
    }

    private initLocalLists(): void {
        this.tourService.loadingCountryList().subscribe({
            next: (item: IMinCityEntity[] | null): void => {
                if (item !== null) {
                    this.localCountyList.set(item);
                }
            }
        });

        this.tourService.loadingManagerList().subscribe({
            next: (items: IMinUser[] | null): void => {
                if (items !== null) {
                    this.localManagerList.set(
                        items.map((res: IMinUser): IDisplayMinUserEntity => {
                            const fName: string = res.firstName + " " + res.lastName;
                            return {id: res.id, fullName: fName, username: res.username} as IDisplayMinUserEntity;
                        })
                    );
                }
            }
        });
    }

    private checkRoles(): void {
        if (this.store.roles().length > 0) {
            for (const str of this.store.roles()) {
                if (str === UserRoles.ADMIN) {
                    this.isAdmin = true;
                }

                if (str === UserRoles.MANAGER) {
                    this.isManager = true;
                }
            }
        }
    }

    private createSearchForm(): void {
        this.searchDataForm = new FormGroup({
            search_text: new FormControl("", Validators.required),
            search_option: new FormControl("", Validators.required)
        });
    }

    private onSelectedRow(): void {
        if (this.tourBlock()?.nativeElement && !this.isSelectedRow) {
            this.render.listen(this.tourBlock()!.nativeElement, "click", (e: Event): void => {
                const h = e.target as HTMLElement;
                if (h.tagName.toLowerCase() === "td") {
                    const r = h.closest("tr") as HTMLTableRowElement;
                    if (r) {
                        const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
                        if (radio) {
                            this.render.setProperty(radio, "checked", true);
                        }

                        this.selectedId = Number.parseInt(r.dataset["tourId"] as string);

                        this.displayList()!.forEach((tour: IAdminTour): void => {
                            if (tour.id === this.selectedId) {
                                this.selectedTour = tour;
                                return;
                            }
                        });

                        if (this.selectedTour) {
                            this.createEditForm();

                            if (this.removeBtn()?.nativeElement) {
                                this.render.listen(this.removeBtn()!.nativeElement, "click", () => {
                                    if (this.selectedTour?.id) {
                                        this.deleteTour(this.selectedTour!.id);
                                        this.selectedTour = undefined;
                                        this.isSelectedRow = false;
                                        this.selectedId = undefined;
                                        this.render.setProperty(this.tourBlock()!.nativeElement, "checked", false);
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    }

    protected initCities(country: IMinCountryEntity): void {
        this.isLoadingCity.set(true);
        this.tourService.loadingCityList(country.id).subscribe({
            next: (item: IMinCityEntity[] | null): void => {
                if (item !== null) {
                    this.localCityLis.set(item);
                    this.isLoadingCity.set(false);
                } else {
                    this.isLoadingCity.set(false);
                }
            }
        });
    }

    protected initHotels(city: IMinCityEntity): void {
        this.isLoadingHotel.set(true);
        this.tourService.loadingHotelList(city.id).subscribe({
            next: (item: IMinHotel[] | null): void => {
                if (item !== null) {
                    this.localHotelList.set(item);
                    this.isLoadingHotel.set(false);
                } else {
                    this.isLoadingHotel.set(false);
                }
            }
        });
    }

    private addItemsToDisplayList(): void {
        effect(() => {
            if (this.displayList() === null && this.tourList().length > 0) {
                this.displayList.set(this.tourList());
                this.isLoadingFailed.set(false);
                if (this.timerId) {
                    window.clearTimeout(this.timerId);
                }
            } else {
                this.timerId = window.setTimeout(() => {
                    this.isLoadingFailed.set(true);
                }, 30000);
            }
        });
    }

    private createAddForm(): void {
        this.addTourForm = new FormGroup({
            name: new FormControl("", Validators.required),
            description: new FormControl("", Validators.required),
            price: new FormControl("", {validators: [Validators.required, Validators.min(1)]}),
            dateStart: new FormControl<Date | null>(null, Validators.required),
            dateEnd: new FormControl<Date | null>(null, Validators.required),
            countryId: new FormControl<IMinCountryEntity | null>(null, Validators.required),
            cityId: new FormControl<IMinCityEntity | null>(null, Validators.required),
            hotelId: new FormControl<IMinHotel | null>(null, Validators.required),
            manager: new FormControl<IDisplayMinUserEntity | null>(null, Validators.required)
        });

        const mn: IDisplayMinUserEntity | null = this.getCurrentManager();

        if (this.isAdmin && this.isManager) {
            if (mn !== null) {
                this.addTourForm.get("manager")?.setValue(mn);
            }
        }

        if (this.isManager && !this.isAdmin) {
            if (mn !== null) {
                this.addTourForm.get("manager")?.setValue(mn);
                this.addTourForm.get("manager")?.disable();
            }
        }
    }

    private createEditForm(): void {
        if (this.selectedTour) {
            this.initLocalLists();
            this.initHotels(this.selectedTour.city);

            console.log(this.selectedTour.manager);
            console.log(this.localManagerList());

            this.editTourForm = new FormGroup({
                id: new FormControl(this.selectedTour.id),
                name: new FormControl(this.selectedTour.name, Validators.required),
                description: new FormControl(this.selectedTour.description, Validators.required),
                price: new FormControl(this.selectedTour.price, {validators: [Validators.required, Validators.min(1)]}),
                dateStart: new FormControl(this.selectedTour.dateStart, Validators.required),
                dateEnd: new FormControl(this.selectedTour.dateEnd, Validators.required),
                hotelId: new FormControl(this.selectedTour.hotel.id, Validators.required),
                manager: new FormControl(this.selectedTour.manager.username, Validators.required)
            });

            if (this.isManager && !this.isAdmin) {
                this.editTourForm.get("manager")?.disable();
            }
        } else {
            this.toast.warning("There are no necessary data");
        }
    }

    protected selectedFile(event: Event): void {
        const element = event.target as HTMLInputElement;

        if (element && element.files && element.files.length > 0) {
            this.mainImageTour = element.files[0];
        }
    }

    protected onSubmit(): void {
        if (this.addTourForm) {
            const values = this.addTourForm.value;

            if (values) {
                console.log("next");
                const data: FormData = new FormData();
                data.append("name", values.name);
                data.append("description", values.description);
                data.append("price", values.price);
                data.append("dateStart", values.dateStart);
                data.append("dateEnd", values.dateEnd);
                if (this.mainImageTour) {
                    data.append("mainImage", this.mainImageTour);
                    this.mainImageTour = undefined;
                }
                data.append("countryId", values.countryId.toString());
                data.append("cityId", values.cityId.toString());
                data.append("hotelId", values.hotelId.toString());
                data.append("managerUsername", values.manager);

                this.tourService.addTour(data).subscribe({
                    next: (item: IAdminTour | null): void => {
                        if (item !== null) {
                            const tmp: IAdminTour[] = this.displayList() || [];

                            tmp.push(item);

                            this.displayList.set(tmp);
                        }
                    }
                });
            }
        }
    }

    protected onSave(): void {
        if (this.editTourForm && this.selectedTour) {
            const values = this.editTourForm.value;

            if (values) {
                const data: FormData = new FormData();
                data.append("id", values.id);
                data.append("name", values.name);
                data.append("description", values.description);
                data.append("price", values.price);
                data.append("dateStart", values.dateStart);
                data.append("dateEnd", values.dateEnd);
                if (this.mainImageTour) {
                    data.append("mainImage", this.mainImageTour);
                    this.mainImageTour = undefined;
                }
                data.append("hotelId", values.hotelId);
                data.append("managerUsername", values.manager);

                this.tourService.updateTour(data).subscribe({
                    next: (item: IAdminTour | null): void => {
                        if (item !== null) {
                            this.displayList.update((r: IAdminTour[] | null): IAdminTour[] | null => {
                                if (r !== null) {
                                    const index: number = r.findIndex((t: IAdminTour): boolean => t.id === item.id);

                                    if (index !== -1) {
                                        r[index] = item;
                                    }
                                }

                                return r;
                            });

                            this.selectedTour = item;
                        }
                    }
                });
            }
        }
    }

    private deleteTour(id: number): void {
        this.tourService.deleteTour(id).subscribe({
            next: (res: boolean): void => {
                if (res && this.displayList() !== null) {
                    const tmp: IAdminTour[] = this.displayList()!;
                    const index: number = tmp.findIndex((t: IAdminTour): boolean => t.id === id);

                    if (index !== -1) {
                        tmp.splice(index, 1);
                    }

                    this.displayList.set(tmp);
                    this.toast.success("The tour has been deleted", this.getOption());
                }
            }
        });
    }

    private getOption(): Object {
        return {
            theme: "snackbar",
            duration: 5000,
            position: "bottom-center",
            dismissible: true,
            autoClose: true,
            style: {
                "border-radius": "30px"
            }
        };
    }

    private getCurrentManager(): IDisplayMinUserEntity | null {
        let currentManager: IDisplayMinUserEntity | null = null;

        this.localManagerList()?.forEach((manager: IDisplayMinUserEntity): void => {
            if (manager.username === this.store.username()) {
                currentManager = manager;
                return;
            }
        });

        return currentManager;
    }

    // private convertManager(manager: IMinUser): IDisplayMinUserEntity {
    //     const fName: string = manager.firstName + " " + manager.lastName;
    //     return {id: manager.id, fullName: fName, username: manager.username} as IDisplayMinUserEntity;
    // }

    protected searchData(): void {
        if (this.searchDataForm) {
            const values = this.searchDataForm.value;

            if (values && values.search_text && values.search_option) {
                const text: string = values.search_text as string;
                const opt: string = values.search_option as string;

                if (text.trim() !== "") {
                    let tour_List: IAdminTour[] = [];

                    if (opt === "tourName") {
                        tour_List = this.tourList().filter((t: IAdminTour): boolean =>
                            t.name.toLowerCase().includes(text.toLowerCase())
                        );
                    }

                    if (opt === "cityName") {
                        tour_List = this.tourList().filter((t: IAdminTour): boolean =>
                            t.city.name.toLowerCase().includes(text.toLowerCase())
                        );
                    }

                    if (opt === "countryName") {
                        tour_List = this.tourList().filter((t: IAdminTour): boolean =>
                            t.country.name.toLowerCase().includes(text.toLowerCase())
                        );
                    }

                    if (tour_List.length > 0) {
                        this.displayList.set(tour_List);
                    }
                }
            }
        }
    }

    protected clearSearch(): void {
        this.searchDataForm?.reset();
        this.displayList.set(this.tourList());
    }

    protected openAddTourModal(): void {
        if (this.addModal()?.nativeElement) {
            this.addModal()?.nativeElement?.showModal();
        }
    }

    protected openEditTourModal(): void {
        if (this.editModal()?.nativeElement) {
            this.editModal()?.nativeElement?.showModal();
        }
    }

    protected closeAddTourModal(): void {
        if (this.addModal()?.nativeElement && this.addModal()?.nativeElement?.open) {
            this.addModal()?.nativeElement?.close();
        }
    }

    protected closeEditTourModal(): void {
        if (this.editModal()?.nativeElement && this.editModal()?.nativeElement?.open) {
            this.editModal()?.nativeElement?.close();
        }
    }

    protected openDescriptionModal(): void {
        if (this.descriptionModal()?.nativeElement) {
            this.descriptionModal()?.nativeElement?.showModal();
        }
    }

    protected openImageModal(): void {
        if (this.imageModal()?.nativeElement) {
            this.imageModal()?.nativeElement?.showModal();
        }
    }

    protected closeDescriptionModal(): void {
        if (this.descriptionModal()?.nativeElement && this.descriptionModal()?.nativeElement?.open) {
            this.descriptionModal()?.nativeElement?.close();
        }
    }

    protected closeImageModal(): void {
        if (this.imageModal()?.nativeElement && this.imageModal()?.nativeElement?.open) {
            this.imageModal()?.nativeElement?.close();
        }
    }

    private showMessage(): void {
        effect(() => {
            if (this.localMessages() !== null) {
                this.toast.show(this.localMessages()!, this.getOption());
            }
        });
    }
}
