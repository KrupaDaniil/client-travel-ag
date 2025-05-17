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
import { CountryService } from "../../../services/country.service";
import { MessageService } from "../../../services/message.service";
import { EntityStorage } from "../../../storage/entity.storage";
import { ICountryEntity } from "../../../interfaces/country-block/i-country.entity";
import { ClimateService } from "../../../services/climate.service";
import { LanguageService } from "../../../services/language.service";
import { IClimateEntity } from "../../../interfaces/country-block/i-climate.entity";
import { ILanguageEntity } from "../../../interfaces/country-block/i-language.entity";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from "@angular/material/sidenav";
import { NgOptimizedImage } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { NgSelectModule } from "@ng-select/ng-select";
import { ICountryRequestEntity } from "../../../interfaces/country-block/i-country-request.entity";
import { IBlobImageEntity } from "../../../interfaces/country-block/i-blob-image.entity";
import { ICountryRequestUpdateEntity } from "../../../interfaces/country-block/i-country-request-update.entity";
import { ICountryCityEntity } from "../../../interfaces/country-block/i-country-city.entity";

@Component({
	selector: "app-country-management",
	imports: [
		ReactiveFormsModule,
		MatSidenavContainer,
		MatSidenav,
		MatSidenavContent,
		NgOptimizedImage,
		MatButtonModule,
		NgSelectModule
	],
	providers: [CountryService, ClimateService, LanguageService, MessageService],
	templateUrl: "./country-management.component.html",
	styleUrl: "./country-management.component.css",
	standalone: true
})
export class CountryManagementComponent implements OnInit, AfterViewChecked {
	private readonly store = inject(EntityStorage);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	private isSelectedRow: boolean;
	loadingFailed: WritableSignal<boolean>;
	private selectedCountry: ICountryEntity | undefined;

	private countryList: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());
	readonly climateList: Signal<IClimateEntity[]> = computed(() => this.store.climatesEntities());
	readonly languageList: Signal<ILanguageEntity[]> = computed(() => this.store.languagesEntities());

	readonly infoMessages: Signal<string | null> = computed(() => this.messages.message());

	displayCountryList: WritableSignal<ICountryEntity[] | null>;
	displayDescriptionCountry: WritableSignal<string | null>;

	addCountryForm: FormGroup | undefined;
	editCountryForm: FormGroup | undefined;
	private flagImg: File | undefined;
	private requestData: FormData | undefined;
	private readonly nameProperties: string[];

	@ViewChild("addingCountryDialog") addingCountryDialog?: ElementRef<HTMLDialogElement>;
	@ViewChild("updateCountryDialog") updateCountryDialog?: ElementRef<HTMLDialogElement>;
	@ViewChild("descriptionDialog") descriptionDialog?: ElementRef<HTMLDialogElement>;
	@ViewChild("countryBlock") countryBlock?: ElementRef<HTMLTableSectionElement>;
	@ViewChild("removeCountryBtn") removeCountryBtn?: ElementRef<HTMLButtonElement>;

	constructor(
		private countryService: CountryService,
		private climateService: ClimateService,
		private languageService: LanguageService,
		private messages: MessageService,
		private render: Renderer2
	) {
		this.isSelectedRow = false;
		this.displayCountryList = signal<ICountryEntity[] | null>(null);
		this.loadingFailed = signal<boolean>(false);
		this.displayDescriptionCountry = signal<string | null>(null);
		this.setContent();
		this.showMessage();
		this.nameProperties = [
			"id",
			"name",
			"currency",
			"phoneCode",
			"flagImage",
			"description",
			"climate",
			"capitalCityName",
			"languages",
			"capitalCity"
		];
	}

	ngOnInit(): void {
		this.countryService.setAllCountry();

		if (this.climateList() && this.climateList().length === 0) {
			this.climateService.addingAllClimates();
		}

		if (this.languageList() && this.languageList().length === 0) {
			this.languageService.addingAllLanguages();
		}

		this.creatingAddForm();
	}

	ngAfterViewChecked(): void {
		this.onSelectTableRow();
	}

	private setContent(): void {
		effect(() => {
			const list: ICountryEntity[] = this.countryList();

			if (this.displayCountryList() === null) {
				if (list && list.length > 0) {
					this.displayCountryList.set(list);
					this.loadingFailed.set(false);
				} else {
					setInterval(() => {
						this.loadingFailed.set(true);
					}, 60000);
				}
			}
		});
	}

	private creatingAddForm(): void {
		this.addCountryForm = new FormGroup({
			name: new FormControl("", Validators.required),
			currency: new FormControl("", Validators.required),
			phoneCode: new FormControl("", Validators.required),
			description: new FormControl(""),
			climate: new FormControl<IClimateEntity | null>(null, Validators.required),
			capitalCityName: new FormControl("", Validators.required),
			languages: new FormControl([], Validators.required)
		});
	}

	private creatingEditForm(): void {
		if (this.selectedCountry) {
			this.editCountryForm = new FormGroup({
				id: new FormControl(this.selectedCountry.id),
				name: new FormControl(this.selectedCountry.name),
				currency: new FormControl(this.selectedCountry.currency),
				phoneCode: new FormControl(this.selectedCountry.phoneCode),
				flagImage: new FormControl<IBlobImageEntity | null>(this.selectedCountry.flagImage),
				description: new FormControl(this.selectedCountry.description),
				climate: new FormControl<IClimateEntity | null>(this.selectedCountry.climate, Validators.required),
				capitalCity: new FormControl(this.selectedCountry.capitalCity.name, Validators.required),
				languages: new FormControl(this.selectedCountry.languages, Validators.required)
			});
		}
	}

	onSelectedFile(event: Event): void {
		const element = event.target as HTMLInputElement;
		if (element && element.files && element.files.length > 0) {
			this.flagImg = element.files[0];
		} else {
			this.flagImg = undefined;
		}
	}

	private onSelectTableRow(): void {
		if (this.countryBlock?.nativeElement && !this.isSelectedRow) {
			this.render.listen(this.countryBlock.nativeElement, "click", (e: Event) => {
				const t = e.target as HTMLElement;
				if (t.tagName.toLowerCase() === "td") {
					const r = t.closest("tr") as HTMLTableRowElement;
					if (r) {
						const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
						if (radio) {
							this.render.setProperty(radio, "checked", true);
						}

						const countryId: number = Number.parseInt(r.dataset["countryId"] as string);

						this.displayCountryList()!.forEach((country: ICountryEntity): void => {
							if (country.id === countryId) {
								this.selectedCountry = country;
								return;
							}
						});

						if (this.selectedCountry) {
							this.creatingEditForm();

							if (this.removeCountryBtn?.nativeElement) {
								this.render.listen(this.removeCountryBtn.nativeElement, "click", () => {
									if (this.selectedCountry?.id) {
										this.deleteCountry(this.selectedCountry?.id);
										this.selectedCountry = undefined;
										this.isSelectedRow = false;
										this.render.setProperty(this.countryBlock!.nativeElement, "checked", false);
									}
								});
							}
						}
					}
				}
			});
		}
	}

	private createCountry(): ICountryRequestEntity | null {
		const formResult = this.addCountryForm?.value;
		if (formResult) {
			return {
				name: formResult.name,
				currency: formResult.currency,
				phoneCode: formResult.phoneCode,
				flagImage: this.flagImg,
				description: formResult.description,
				climate: formResult.climate,
				capitalCityName: formResult.capitalCityName,
				languages: formResult.languages
			} as ICountryRequestEntity;
		} else {
			return null;
		}
	}

	private createUpdateEntity(): ICountryRequestUpdateEntity | null {
		if (this.editCountryForm?.valid) {
			const formData = this.editCountryForm?.value;
			const country: ICountryEntity | undefined = this.selectedCountry;
			if (formData && country) {
				const send: ICountryCityEntity = {
					id: country.capitalCity.id,
					name: formData.capitalCity
				};

				return {
					id: formData.id,
					name: formData.name,
					currency: formData.currency,
					phoneCode: formData.phoneCode,
					flagImage: this.flagImg,
					description: formData.description,
					climate: formData.climate,
					capitalCityName: send,
					languages: formData.languages
				} as ICountryRequestUpdateEntity;
			}
		}

		return null;
	}

	protected requestCountry(): void {
		const country: ICountryRequestEntity | null = this.createCountry();
		if (country !== null) {
			this.requestData = new FormData();
			this.requestData?.append(this.nameProperties[1], country.name);
			this.requestData?.append(this.nameProperties[2], country.currency);
			this.requestData?.append(this.nameProperties[3], country.phoneCode);
			if (this.flagImg) {
				this.requestData?.append(this.nameProperties[4], country.flagImage!, country.flagImage?.name);
			}
			this.requestData?.append(this.nameProperties[5], country.description);
			this.requestData?.append(
				this.nameProperties[6],
				new Blob([JSON.stringify(country.climate)], { type: "application/json" })
			);
			this.requestData?.append(this.nameProperties[7], country.capitalCityName);
			this.requestData?.append(
				this.nameProperties[8],
				new Blob([JSON.stringify(country.languages)], { type: "application/json" })
			);

			this.countryService.addingCountry(this.requestData).then((result: boolean): void => {
				if (result) {
					this.displayCountryList.set(this.countryList());

					this.messages.setMessage("Country created");
					this.showInfo();
				} else {
					this.messages.setMessage("Country not created");
					this.showInfo();
				}
			});
		} else {
			this.messages.setMessage("Missing data to send");
			this.showInfo();
		}
	}

	protected updateCountry(): void {
		const country: ICountryRequestUpdateEntity | null = this.createUpdateEntity();

		if (country !== null) {
			this.requestData = new FormData();
			this.requestData?.append(this.nameProperties[0], country.id.toString());
			this.requestData?.append(this.nameProperties[1], country.name);
			this.requestData?.append(this.nameProperties[2], country.currency);
			this.requestData?.append(this.nameProperties[3], country.phoneCode);
			if (this.flagImg) {
				this.requestData?.append(this.nameProperties[4], country.flagImage!, country.flagImage?.name);
			}
			this.requestData?.append(this.nameProperties[5], country.description);
			this.requestData?.append(
				this.nameProperties[6],
				new Blob([JSON.stringify(country.climate)], { type: "application/json" })
			);
			this.requestData?.append(
				this.nameProperties[9],
				new Blob([JSON.stringify(country.capitalCityName)], { type: "application/json" })
			);
			this.requestData?.append(
				this.nameProperties[8],
				new Blob([JSON.stringify(country.languages)], { type: "application/json" })
			);

			this.countryService.updateCountry(this.requestData).then((result: boolean): void => {
				if (result) {
					this.displayCountryList.set(this.countryList());

					this.messages.setMessage("Country updated");
					this.showInfo();
				} else {
					this.messages.setMessage("Country not updated");
					this.showInfo();
				}
			});
		}
	}

	setDescription(event: Event): void {
		const element = event.target as HTMLElement;
		const id = Number.parseInt(element.dataset["dsCountryId"] as string);
		const country: ICountryEntity | undefined = this.countryList().find(
			(entity: ICountryEntity): ICountryEntity | undefined => {
				if (entity.id === id) {
					return entity;
				} else {
					return undefined;
				}
			}
		);

		if (country) {
			this.displayDescriptionCountry.set(country.description);
			if (this.descriptionDialog?.nativeElement) {
				this.descriptionDialog?.nativeElement.showModal();
			}
		}
	}

	showMessage(): void {
		effect(() => {
			if (this.infoMessages() !== null) {
				this.snackBar.open(this.infoMessages() as string, "close", {
					verticalPosition: "bottom",
					horizontalPosition: "center"
				});
			}
		});
	}

	private showInfo(): void {
		this.snackBar.open(this.infoMessages() as string, "close", {
			verticalPosition: "bottom",
			horizontalPosition: "center"
		});
	}

	openAddCountryModal(): void {
		if (this.addingCountryDialog?.nativeElement) {
			this.addingCountryDialog?.nativeElement.showModal();
		}
	}

	openUpdateCountryModal(): void {
		if (this.updateCountryDialog?.nativeElement) {
			this.updateCountryDialog?.nativeElement.showModal();
		}
	}

	closeAddCountryModal(): void {
		if (this.addingCountryDialog?.nativeElement) {
			this.addingCountryDialog?.nativeElement.close();
		}
	}

	closeUpdateCountryModal(): void {
		if (this.updateCountryDialog?.nativeElement) {
			this.updateCountryDialog?.nativeElement.close();
		}
	}

	closeDescriptionModal(): void {
		if (this.descriptionDialog?.nativeElement) {
			this.descriptionDialog?.nativeElement.close();
		}
	}

	private deleteCountry(id: number): void {
		this.countryService.deleteCountry(id).then((result: boolean): void => {
			if (result) {
				this.store.removeCountry(id);
				this.displayCountryList.set(this.countryList());
				this.messages.setMessage("Country deleted");
				this.showInfo();
			}
		});
	}
}
