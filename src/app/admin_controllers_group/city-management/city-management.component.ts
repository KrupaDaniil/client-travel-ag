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
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: "app-city-management",
  imports: [
    FormsModule,
    NgSelectComponent,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgIf
  ],
  providers: [CityService, MessageService],
  templateUrl: "./city-management.component.html",
  styleUrl: "./city-management.component.css",
  standalone: true
})
export class CityManagementComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(EntityStorage);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private isSetEntitiesFlag: boolean;
  private isSetIntervalFlag: boolean;
  private isSelectedRow: boolean;
  private selectedCity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined;

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
  @ViewChild("searchBtn") searchBtn?: ElementRef<HTMLButtonElement>;

  private cityImg: File | undefined;
  protected addCityForm: FormGroup | undefined;
  protected editCityForm: FormGroup | undefined;

  constructor(
    private cityService: CityService,
    private message: MessageService,
    private countryService: CountryService,
    private render: Renderer2
  ) {
    this.displayCityList = signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null>(null);
    this.descriptionCity = signal<string | null>(null);
    this.imageCityUrl = signal<string | null>(null);
    this.loadingFailed = signal<boolean>(false);
    this.isSetEntitiesFlag = false;
    this.isSelectedRow = false;
    this.isSetIntervalFlag = false;

    this.setDisplayEntities();
    this.setCountries();

    this.showMessage();
  }

  ngOnInit(): void {
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
          setInterval(() => {
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

      this.cityService.addCityEntity(requestData).then((res: boolean): void => {
        if (res) {
          this.displayCityList.set(this.cityList());
          this.closeAddCityModal();
          this.message.setMessage("City added successfully");
          this.showInfoMessage();
        } else {
          this.showInfoMessage();
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

      this.cityService.updateCityEntity(data).then((res: boolean): void => {
        if (res) {
          this.displayCityList.set(this.cityList());
          this.closeUpdateCityModal();
          this.message.setMessage("City updated successfully");
          this.showInfoMessage();
        } else {
          this.showInfoMessage();
        }
      });
    }
  }

  private deleteCity(id: number): void {
    this.cityService.deleteCityEntity(id).then((res: boolean): void => {
      if (res) {
        this.displayCityList.set(this.cityList());
        this.message.setMessage("City deleted successfully");
        this.showInfoMessage();
      } else {
        this.showInfoMessage();
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

    console.log(currentCity);

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

  private getCurrentCity(
    event: Event,
    dtsName: string
  ): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | undefined {
    const element = event.target as HTMLElement;
    const id: number = Number.parseInt(element.dataset[dtsName] as string);

    return this.cityList().find((item: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>) => item.id === id);
  }

  private showMessage(): void {
    effect(() => {
      if (this.messageInfo() !== null) {
        this.snackBar.open(this.messageInfo() as string, "close", {
          verticalPosition: "bottom",
          horizontalPosition: "center"
        });
      }
    });
  }

  private showInfoMessage(): void {
    this.snackBar.open(this.messageInfo() as string, "close", {
      verticalPosition: "bottom",
      horizontalPosition: "center"
    });
  }

  onSelectedFile(event: Event): void {
    const element = event.target as HTMLInputElement;

    if (element && element.files && element.files.length > 0) {
      this.cityImg = element.files[0];
    } else {
      this.cityImg = undefined;
    }

    console.log(this.cityImg);
  }
}
