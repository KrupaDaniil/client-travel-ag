import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from "@angular/core";
import {EntityStorage} from "../../../storage/entity.storage";
import {CityService} from "../../../services/city.service";
import {MessageService} from "../../../services/message.service";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {NgSelectComponent} from "@ng-select/ng-select";
import {ICityEntity} from "../../../interfaces/country-block/i-city.entity";
import {IMainCountryForCityEntity} from "../../../interfaces/country-block/i-main-country-for-city.entity";
import {IBlobImageEntity} from "../../../interfaces/country-block/i-blob-image.entity";
import {ICountryEntity} from "../../../interfaces/country-block/i-country.entity";
import {CountryService} from "../../../services/country.service";
import {HotToastService} from '@ngxpert/hot-toast';
import {NgxPaginationModule} from "ngx-pagination";

@Component({
    selector: "app-city-management",
    imports: [
        FormsModule,
        NgSelectComponent,
        ReactiveFormsModule,
        NgOptimizedImage,
        NgIf,
        NgxPaginationModule
    ],
    providers: [CityService, MessageService],
    templateUrl: "./city-management.component.html",
    styleUrl: "./city-management.component.css",
    standalone: true
})
export class CityManagementComponent implements OnInit, AfterViewChecked {
    private readonly store = inject(EntityStorage);
    private toastBar: HotToastService = inject(HotToastService);
    private isSetEntitiesFlag: boolean;
    private isSetIntervalFlag: boolean;
    private isSelectedRow: boolean;
    protected readonly itemsCount: number;
    protected page: number;
    private selectedCity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined;
    private searchList: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | undefined;

    private cityList: Signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]> = computed(() =>
        this.store.admin_citiesEntities()
    );
    protected countryList: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());

    private messageInfo: Signal<string | null> = computed(() => this.message.message());

    displayCityList: WritableSignal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null>;
    descriptionCity: WritableSignal<string | null>;
    imageCityUrl: WritableSignal<string | null>;
    loadingFailed: WritableSignal<boolean>;

    @ViewChild("addingCityDialog") addingCityDialog?: ElementRef<HTMLDialogElement>;
    @ViewChild("updateCityDialog") updateCityDialog?: ElementRef<HTMLDialogElement>;
    @ViewChild("imageDialog") imageDialog?: ElementRef<HTMLDialogElement>;
    @ViewChild("descriptionDialog") descriptionDialog?: ElementRef<HTMLDialogElement>;
    @ViewChild("cityBlock") cityBlock?: ElementRef<HTMLTableSectionElement>;
    @ViewChild("removeCityBtn") removeCityBtn?: ElementRef<HTMLButtonElement>;

    private cityImg: File | undefined;
    protected addCityForm: FormGroup | undefined;
    protected editCityForm: FormGroup | undefined;
    protected searchDataForm: FormGroup | undefined;

    constructor(private cityService: CityService, private message: MessageService,
                private countryService: CountryService, private render: Renderer2) {
        this.displayCityList = signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null>(null);
        this.descriptionCity = signal<string | null>(null);
        this.imageCityUrl = signal<string | null>(null);
        this.loadingFailed = signal<boolean>(false);
        this.isSetEntitiesFlag = false;
        this.isSelectedRow = false;
        this.isSetIntervalFlag = false;
        this.itemsCount = 10;
        this.page = 1;

        this.setDisplayEntities();
        this.setCountries();

        this.showMessage();
    }

    ngOnInit(): void {
        this.createSearchForm();
        this.cityService.setAllAdminCities();
        this.createCityForm();
    }

    ngAfterViewChecked(): void {
        this.onSelectTableRow();
    }

    setDisplayEntities(): void {
        effect(() => {
            if (this.cityList() && this.cityList().length > 0 && !this.isSetEntitiesFlag) {
                this.isSetEntitiesFlag = true;
                this.displayCityList.set(this.cityList());
                this.loadingFailed.set(false);
            } else {
                if (!this.isSetIntervalFlag) {
                    setTimeout(() => {
                        this.loadingFailed.set(true);
                    }, 30000);
                    this.isSetIntervalFlag = true;
                }
            }
        });
    }

    setCountries(): void {
        effect(() => {
            if (this.countryList() && this.countryList().length === 0) {
                this.countryService.setAllCountry();
            }
        });
    }

    private createSearchForm(): void {
        this.searchDataForm = new FormGroup({
            search_text: new FormControl("", Validators.required),
            search_option: new FormControl("", Validators.required)
        });
    }

    private createCityForm(): void {
        this.addCityForm = new FormGroup({
            name: new FormControl("", Validators.required),
            country: new FormControl<IMainCountryForCityEntity | null>(null, Validators.required),
            description: new FormControl("", Validators.required)
        });
    }

    protected requestCity(): void {
        if (this.addCityForm?.value) {
            const city: ICityEntity<IMainCountryForCityEntity, File | undefined> = {
                id: 0,
                name: this.addCityForm.value.name,
                description: this.addCityForm.value.description,
                cityImage: this.cityImg,
                country: this.addCityForm.value.country
            };

            const requestData: FormData = new FormData();
            requestData.append("id", city.id.toString());
            requestData.append("name", city.name);
            requestData.append("description", city.description);
            if (city.cityImage) {
                requestData.append("cityImage", city.cityImage);
            }

            requestData.append("country", city.country.id.toString());

            this.cityService.addCityEntity(requestData)
                .then((res: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null): void => {
                    if (res !== null) {
                        const tmp: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] = this.displayCityList() || [];
                        tmp.push(res);
                        this.displayCityList.set(tmp);

                        this.closeAddCityModal();
                        this.message.setMessage("City added successfully");
                    }
                });
        }
    }

    private editCityFormCreated(): void {
        if (this.selectedCity) {
            this.editCityForm = new FormGroup({
                id: new FormControl(this.selectedCity.id),
                name: new FormControl(this.selectedCity.name, Validators.required),
                description: new FormControl(this.selectedCity.description),
                country: new FormControl(this.selectedCity.country.name)
            });
        }
    }

    protected updateCity(): void {
        if (this.editCityForm?.valid && this.editCityForm?.value) {
            const city: ICityEntity<IMainCountryForCityEntity, File | undefined> = {
                id: this.editCityForm.value.id,
                name: this.editCityForm.value.name,
                description: this.editCityForm.value.description,
                cityImage: this.cityImg,
                country: this.selectedCity!.country
            };

            const data: FormData = new FormData();
            data.append("id", city.id.toString());
            data.append("name", city.name);
            data.append("description", this.editCityForm.value.description);
            if (city.cityImage) {
                data.append("cityImage", city.cityImage);
            }
            data.append("country", city.country.id.toString());

            this.cityService.updateCityEntity(data)
                .then((res: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null): void => {
                    if (res !== null) {
                        this.displayCityList
                            .update((ct: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null) => {
                                if (ct !== null) {
                                    const index: number = ct
                                        .findIndex((r: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): boolean => r.id === res.id);

                                    if (index !== -1) {
                                        ct[index] = res;
                                    }
                                }
                                return ct;
                            })
                        this.closeUpdateCityModal();
                        this.message.setMessage("City updated successfully");
                    }
                });
        }
    }

    private deleteCity(id: number): void {
        this.cityService.deleteCityEntity(id).then((res: boolean): void => {
            if (res) {
                if (this.displayCityList() !== null && this.displayCityList()!.length > 0) {
                    const ds: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] = this.displayCityList()!;
                    for (let i = 0; i < ds.length; i++) {
                        if (ds[i].id === id) {
                            ds.splice(i, 1);
                            break;
                        }
                    }

                    this.displayCityList.set(ds);
                    this.message.setMessage("City deleted successfully");
                }
            }
        });
    }

    private onSelectTableRow(): void {
        if (this.cityBlock?.nativeElement && !this.isSelectedRow) {
            this.render.listen(this.cityBlock.nativeElement, "click", (e: Event) => {
                const element = e.target as HTMLElement;
                if (element.tagName.toLowerCase() === "td") {
                    const r = element.closest("tr") as HTMLTableRowElement;
                    if (r) {
                        const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
                        if (radio) {
                            this.render.setProperty(radio, "checked", true);
                        }

                        const cityId: number = Number.parseInt(r.dataset["cityId"] as string);

                        this.displayCityList()!.forEach((city: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): void => {
                            if (city.id === cityId) {
                                this.selectedCity = city;
                                return;
                            }
                        });

                        if (this.selectedCity) {
                            this.editCityFormCreated();

                            if (this.removeCityBtn?.nativeElement) {
                                this.render.listen(this.removeCityBtn.nativeElement, "click", () => {
                                    if (this.selectedCity?.id) {
                                        this.deleteCity(this.selectedCity?.id);
                                        this.selectedCity = undefined;
                                        this.isSelectedRow = false;
                                        this.render.setProperty(this.cityBlock!.nativeElement, "checked", false);
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    }

    openAddCityModal(): void {
        if (this.addingCityDialog?.nativeElement) {
            this.addingCityDialog.nativeElement.showModal();
        }
    }

    openUpdateCityModal(): void {
        if (this.updateCityDialog?.nativeElement) {
            this.updateCityDialog.nativeElement.showModal();
        }
    }

    setImage(event: Event): void {
        const currentCity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined = this.getCurrentCity(
            event,
            "imgCityId"
        );

        if (currentCity) {
            if (currentCity.cityImage) {
                this.imageCityUrl.set(currentCity.cityImage.blobUrl);

                if (this.imageDialog?.nativeElement) {
                    this.imageDialog.nativeElement.showModal();
                }
            }
        }
    }

    setDescription(event: Event): void {
        const currentCity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined = this.getCurrentCity(
            event,
            "dsCityId"
        );

        if (currentCity) {
            this.descriptionCity.set(currentCity.description);

            if (this.descriptionDialog?.nativeElement) {
                this.descriptionDialog.nativeElement.showModal();
            }
        }
    }

    closeAddCityModal(): void {
        if (this.addingCityDialog?.nativeElement) {
            this.addingCityDialog.nativeElement.close();
        }
    }

    closeUpdateCityModal(): void {
        if (this.updateCityDialog?.nativeElement) {
            this.updateCityDialog.nativeElement.close();
        }
    }

    closeImageModal(): void {
        if (this.imageDialog?.nativeElement) {
            this.imageDialog.nativeElement.close();
        }
    }

    closeDescriptionModal(): void {
        if (this.descriptionDialog?.nativeElement) {
            this.descriptionDialog.nativeElement.close();
        }
    }

    private getCurrentCity(event: Event, dtsName: string): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined {
        const element = event.target as HTMLElement;
        const id: number = Number.parseInt(element.dataset[dtsName] as string);

        return this.cityList().find((item: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>) => item.id === id);
    }

    private showMessage(): void {
        effect(() => {
            if (this.messageInfo() !== null) {
                this.toastBar.show(this.messageInfo()?.toString(), {
                    theme: "snackbar",
                    duration: 5000,
                    position: "bottom-center",
                    dismissible: true,
                    autoClose: true,
                    style: {
                        "borderRadius": "30px"
                    }
                });
            }
        });
    }

    onSelectedFile(event: Event): void {
        const element = event.target as HTMLInputElement;

        if (element && element.files && element.files.length > 0) {
            this.cityImg = element.files[0];
        } else {
            this.cityImg = undefined;
        }
    }

    searchData(): void {
        if (this.searchDataForm) {
            const values = this.searchDataForm.value;

            if (values && values.search_text && values.search_option) {
                const opt: string = values.search_option as string;
                const text: string = values.search_text as string;

                if (opt === "cityName" && text.trim() !== "") {
                    this.searchList = this.cityList()
                        .filter((r: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): boolean => {
                            return r.name.toLowerCase().includes(text.trim().toLowerCase());
                        })
                }

                if (values.search_option === "countryName") {
                    this.searchList = this.cityList()
                        .filter((r: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): boolean => {
                            return r.country.name.toLowerCase().includes(text.trim().toLowerCase());
                        })
                }

                if (this.searchList && this.searchList.length > 0) {
                    this.displayCityList.set(this.searchList);
                }
            }
        }
    }

    clearSearch(): void {
        this.searchDataForm?.reset();
        this.displayCityList.set(this.cityList());
    }

}
