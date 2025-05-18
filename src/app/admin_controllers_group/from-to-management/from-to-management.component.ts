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
import { EntityStorage } from "../../../storage/entity.storage";
import { FromToService } from "../../../services/from-to.service";
import { MessageService } from "../../../services/message.service";
import { IFromToEntity } from "../../../interfaces/filters-block/i-from-to.entity";
import { IFromCountryEntity } from "../../../interfaces/filters-block/i-from-country.entity";
import { IFTCityEntity } from "../../../interfaces/filters-block/i-f-t-city.entity";
import { ICountryCityEntity } from "../../../interfaces/country-block/i-country-city.entity";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CountryCityEntity } from "../../../models/country-city.entity";
import { IMainCountryForCityEntity } from "../../../interfaces/country-block/i-main-country-for-city.entity";
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { NgSelectModule } from "@ng-select/ng-select";

@Component({
	selector: "app-from-to-management",
	imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, NgSelectModule, ReactiveFormsModule],
	providers: [FromToService, MessageService],
	templateUrl: "./from-to-management.component.html",
	styleUrl: "./from-to-management.component.css"
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

	selectedFromToEntity: IFromToEntity | undefined;

	additionForm: FormGroup | undefined;
	updateForm: FormGroup | undefined;

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

	constructor(private fromToService: FromToService, private message: MessageService, private render: Renderer2) {
		this.displayList = signal<IFromToEntity[] | null>(null);
		this.fromCityList = signal<ICountryCityEntity[] | null>(null);
		this.toCityList = signal<ICountryCityEntity[] | null>(null);
		this.loadingFailed = signal<boolean>(false);

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

	private onSelectedRow(): void {}

	private creatingAddingForm(): void {
		this.additionForm = new FormGroup({
			country: new FormControl<IFromCountryEntity | null>(null, Validators.required),
			city: new FormControl<ICountryCityEntity | null>(null, Validators.required),
			countries: new FormControl<IFromCountryEntity[] | null>(null, Validators.required),
			cities: new FormControl<ICountryCityEntity[] | null>(null, Validators.required)
		});
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

		this.toCityList.set(countries);
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
				country: new FormControl({ value: this.selectedFromToEntity.cityFrom.country, disabled: true }),
				city: new FormControl({ value: city, disabled: true }),
				countries: new FormControl(countries, Validators.required),
				cities: new FormControl(cityList, Validators.required)
			});
		}
	}

	openAddFrTEntityModal(): void {}

	openUpdateFrTEntityModal(): void {}

	closeAddFrTEntityModal(): void {}

	closeUpdateFrTEntityModal(): void {}
}
