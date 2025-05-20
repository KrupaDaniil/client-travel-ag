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
import {EntityStorage} from "../../../storage/entity.storage";
import {FromToService} from "../../../services/from-to.service";
import {MessageService} from "../../../services/message.service";
import {IFromToEntity} from "../../../interfaces/filters-block/i-from-to.entity";
import {IFromCountryEntity} from "../../../interfaces/filters-block/i-from-country.entity";
import {IFTCityEntity} from "../../../interfaces/filters-block/i-f-t-city.entity";
import {ICountryCityEntity} from "../../../interfaces/country-block/i-country-city.entity";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CountryCityEntity} from "../../../models/country-city.entity";
import {IMainCountryForCityEntity} from "../../../interfaces/country-block/i-main-country-for-city.entity";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {NgSelectComponent, NgSelectModule} from "@ng-select/ng-select";

@Component({
  selector: "app-from-to-management",
  imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, NgSelectModule, ReactiveFormsModule],
  providers: [FromToService, MessageService],
  templateUrl: "./from-to-management.component.html",
  styleUrl: "./from-to-management.component.css",
  standalone: true
})
export class FromToManagementComponent implements OnInit {
  private readonly store = inject(EntityStorage);

  private listFromToEntity: Signal<IFromToEntity[]> = computed(() => this.store.fromToEntitiesEntities());
  displayList: WritableSignal<IFromToEntity[] | null>;
  listFromToCountry: Signal<IFromCountryEntity[]> = computed(() => this.store.fromToCountriesEntities()); // use in ng-selects
  infoMessages: Signal<string | null> = computed(() => this.message.message());

  fromCityList: WritableSignal<ICountryCityEntity[] | null>;
  toCityList: WritableSignal<ICountryCityEntity[] | null>;
  loadingFailed: WritableSignal<boolean>;
  private readonly localCountry: WritableSignal<IFromCountryEntity[] | null>;
  protected cntCount: number = 0;

  selectedFromToEntity: IFromToEntity | undefined;

  additionForm: FormGroup | undefined;
  updateForm: FormGroup | undefined;
  private names: string[];

  private readonly searchBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>("searchBtn");
  private readonly removeBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>("removeFrTEntityBtn");

  private readonly countryBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
    viewChild<ElementRef<HTMLTableSectionElement>>("countryBlock");
  private readonly modalAdd: Signal<ElementRef<HTMLDialogElement> | undefined> =
    viewChild<ElementRef<HTMLDialogElement>>("addingFrTEntityDialog");
  private readonly modalUpdate: Signal<ElementRef<HTMLDialogElement> | undefined> =
    viewChild<ElementRef<HTMLDialogElement>>("updateFrTEntityDialog");
  private readonly addCitiesSelect: Signal<ElementRef<NgSelectComponent> | undefined> =
    viewChild<ElementRef<NgSelectComponent>>("addCitiesSlc");

  constructor(private fromToService: FromToService, private message: MessageService, private render: Renderer2) {
    this.displayList = signal<IFromToEntity[] | null>(null);
    this.fromCityList = signal<ICountryCityEntity[] | null>(null);
    this.toCityList = signal<ICountryCityEntity[] | null>(null);
    this.loadingFailed = signal<boolean>(false);
    this.localCountry = signal<IFromCountryEntity[] | null>(null);
    this.names = ["country", "city", "countries", "cities"];
    this.setContent();
  }

  ngOnInit(): void {
    this.fromToService.setAllFromToEntities();
    this.fromToService.setAllFromToCountries();

    this.creatingAddingForm();
  }

  private setContent(): void {
    effect(() => {
      const entities: IFromToEntity[] = this.listFromToEntity();

      if (this.displayList() === null) {
        if (entities && entities.length > 0) {
          this.displayList.set(entities);
          this.loadingFailed.set(false);
        } else {
          setInterval(() => {
            this.loadingFailed.set(true);
          }, 60000);
        }
      }
    });
  }

  private onSelectedRow(): void {
  }

  private creatingAddingForm(): void {
    this.additionForm = new FormGroup({
      country: new FormControl<IFromCountryEntity | null>(null, Validators.required),
      city: new FormControl<ICountryCityEntity | null>({value: null, disabled: true}, Validators.required),
      countries: new FormControl<IFromCountryEntity[] | null>({value: null, disabled: true}, Validators.required),
      cities: new FormControl<ICountryCityEntity[] | null>({value: null, disabled: true}, Validators.required)
    });

    this.linearActivation();
  }

  protected onSave(): void {
    const values = this.additionForm?.value;

    if (values) {
      const countries = values.countries as IFromCountryEntity[];
      const cities = values.cities as ICountryCityEntity[];

      const map = new Map<number, IMainCountryForCityEntity>();

      for (const country of countries) {
        for (const city of cities) {
          map.set(city.id, {id: country.id, name: country.name} as IMainCountryForCityEntity);
        }
      }

      const toRes: IFTCityEntity[] = cities.map((city: ICountryCityEntity) => {
        const entity: IFTCityEntity = {
          id: city.id,
          name: city.name,
          country: map.get(city.id)!
        };

        return entity;
      });

      const fromToEntity: IFromToEntity = {
        id: 0,
        cityFrom: {
          id: values.city.id,
          name: values.city.name,
          country: {id: values.country.id, name: values.country.name} as IMainCountryForCityEntity
        } as IFTCityEntity,
        citiesTo: toRes
      };

      console.log(fromToEntity);

      this.fromToService.setFromToEntity(fromToEntity);
    }
  }

  protected onAdd(country: IFromCountryEntity): void {
    if (this.fromCityList() && this.fromCityList.length > 0) {
      this.fromCityList.set(null);
    }

    this.fromCityList.set(country.cities);
  }

  protected onChange(countries: IFromCountryEntity[]): void {
    if (this.toCityList() && this.fromCityList.length > 0) {
      this.toCityList.set(null);
    }

    this.localCountry.set(countries);

    this.setToCityList();
  }

  protected onRemoveCountry(country: IFromCountryEntity): void {
    this.additionForm?.get(this.names[3])?.reset();
  }

  private creatingUpdateFrom(): void {
    if (this.selectedFromToEntity) {
      const city: ICountryCityEntity = {
        id: this.selectedFromToEntity.cityFrom.id,
        name: this.selectedFromToEntity.cityFrom.name
      };

      const cityList: ICountryCityEntity[] = this.selectedFromToEntity.citiesTo.map(
        ct => new CountryCityEntity(ct.id, ct.name)
      );

      const countries: IMainCountryForCityEntity[] = this.selectedFromToEntity.citiesTo.map(ct => ct.country);

      this.updateForm = new FormGroup({
        country: new FormControl({value: this.selectedFromToEntity.cityFrom.country, disabled: true}),
        city: new FormControl({value: city, disabled: true}),
        countries: new FormControl(countries, Validators.required),
        cities: new FormControl(cityList, Validators.required)
      });
    }
  }

  protected openAddFrTEntityModal(): void {
    if (this.modalAdd()?.nativeElement) {
      this.modalAdd()!.nativeElement.showModal();
    }
  }

  protected openUpdateFrTEntityModal(): void {
    if (this.modalUpdate()?.nativeElement) {
      this.modalUpdate()!.nativeElement.showModal();
    }
  }

  protected closeAddFrTEntityModal(): void {
    if (this.modalAdd()?.nativeElement && this.modalAdd()!.nativeElement.open) {
      this.modalAdd()!.nativeElement.close();
    }
  }

  protected closeUpdateFrTEntityModal(): void {
    if (this.modalUpdate()?.nativeElement && this.modalUpdate()!.nativeElement.open) {
      this.modalUpdate()!.nativeElement.close();
    }
  }

  private setToCityList(): void {
    if (this.localCountry() && this.localCountry()!.length > 0) {
      const cities: ICountryCityEntity[] = [];

      this.localCountry()!.forEach(country => country.cities.forEach(city => cities.push(city)));

      this.toCityList.set(cities);
    }
  }

  private linearActivation(): void {
    this.additionForm?.get(this.names[0])?.valueChanges.subscribe((vl: IFromCountryEntity) => {
      if (vl) {
        this.additionForm?.get(this.names[1])?.enable();
      } else {
        this.additionForm?.get(this.names[1])?.reset();
        this.additionForm?.get(this.names[1])?.disable();
        this.additionForm?.get(this.names[2])?.reset();
        this.additionForm?.get(this.names[2])?.disable();
        this.additionForm?.get(this.names[3])?.reset();
        this.additionForm?.get(this.names[3])?.disable();
      }
    });

    this.additionForm?.get(this.names[1])?.valueChanges.subscribe((vl: ICountryCityEntity) => {
      if (vl) {
        this.additionForm?.get(this.names[2])?.enable();
      } else {
        this.additionForm?.get(this.names[2])?.reset();
        this.additionForm?.get(this.names[2])?.disable();
        this.additionForm?.get(this.names[3])?.reset();
        this.additionForm?.get(this.names[3])?.disable();
      }
    });

    this.additionForm?.get(this.names[2])?.valueChanges.subscribe((vl: IFromCountryEntity[]) => {
      if (vl && vl.length > 0) {
        this.additionForm?.get(this.names[3])?.enable();
      } else {
        this.additionForm?.get(this.names[3])?.reset();
        this.additionForm?.get(this.names[3])?.disable();
      }
    });
  }

  protected upCount(): void {
    this.cntCount++;
  }

  protected resetCount(): void {
    this.cntCount = 0;
  }
}
