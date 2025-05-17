import {
	AfterViewChecked,
	Component,
	computed,
	inject,
	OnInit,
	Renderer2,
	signal,
	Signal,
	WritableSignal
} from "@angular/core";
import { EntityStorage } from "../../../storage/entity.storage";
import { FromToService } from "../../../services/from-to.service";
import { MessageService } from "../../../services/message.service";
import { IFromToEntity } from "../../../interfaces/filters-block/i-from-to.entity";
import { IFromCountryEntity } from "../../../interfaces/filters-block/i-from-country.entity";
import { IFTCityEntity } from "../../../interfaces/filters-block/i-f-t-city.entity";
import { ICountryCityEntity } from "../../../interfaces/country-block/i-country-city.entity";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
	selector: "app-from-to-management",
	imports: [],
	providers: [FromToService, MessageService],
	templateUrl: "./from-to-management.component.html",
	styleUrl: "./from-to-management.component.css"
})
export class FromToManagementComponent implements OnInit, AfterViewChecked {
	private readonly store = inject(EntityStorage);

	listFromToEntity: Signal<IFromToEntity[]> = computed(() => this.store.fromToEntitiesEntities());
	listFromToCountry: Signal<IFromCountryEntity[]> = computed(() => this.store.fromToCountriesEntities());
	infoMessages: Signal<string | null> = computed(() => this.message.message());
	fromCityList: WritableSignal<ICountryCityEntity[] | null>;
	toCityList: WritableSignal<ICountryCityEntity[] | null>;

	additionForm: FormGroup | undefined;
	updateForm: FormGroup | undefined;

	constructor(private fromToService: FromToService, private message: MessageService, private render: Renderer2) {
		this.fromCityList = signal<ICountryCityEntity[] | null>(null);
		this.toCityList = signal<ICountryCityEntity[] | null>(null);
	}

	ngOnInit(): void {
		this.fromToService.setAllFromToEntities();
		this.fromToService.setAllFromToCountries();
	}

	ngAfterViewChecked(): void {}

	private creatingAddingForm(): void {
		this.additionForm = new FormGroup({
			country: new FormControl("", Validators.required),
			city: new FormControl("", Validators.required),
			countries: new FormControl("", Validators.required),
			cities: new FormControl("", Validators.required)
		});
	}
}
