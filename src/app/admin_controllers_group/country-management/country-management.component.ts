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
import { CountryService } from "../../../services/country.service";
import { MessageService } from "../../../services/message.service";
import { EntityStorage } from "../../../storage/entity.storage";
import { ICountryEntity } from "../../../interfaces/country-block/i-country.entity";
import { ClimateService } from "../../../services/climate.service";
import { LanguageService } from "../../../services/language.service";
import { IClimateEntity } from "../../../interfaces/country-block/i-climate.entity";
import { ILanguageEntity } from "../../../interfaces/country-block/i-language.entity";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgIf, NgOptimizedImage } from "@angular/common";
import { NgSelectModule } from "@ng-select/ng-select";
import { ICountryRequestEntity } from "../../../interfaces/country-block/i-country-request.entity";
import { ICountryRequestUpdateEntity } from "../../../interfaces/country-block/i-country-request-update.entity";
import { ICountryCityEntity } from "../../../interfaces/country-block/i-country-city.entity";
import { HotToastService } from "@ngxpert/hot-toast";

@Component({
	selector: "app-country-management",
	imports: [ReactiveFormsModule, NgOptimizedImage, NgSelectModule, NgIf],
	providers: [CountryService, ClimateService, LanguageService, MessageService],
	templateUrl: "./country-management.component.html",
	styleUrl: "./country-management.component.css",
	standalone: true
})
export class CountryManagementComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	private toastBar: HotToastService = inject(HotToastService);

	private isSelectedRow: boolean;
	private timerId: number | undefined;
	loadingFailed: WritableSignal<boolean>;
	protected selectedCountry: ICountryEntity | undefined;

	private countryList: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());
	readonly climateList: Signal<IClimateEntity[]> = computed(() => this.store.climatesEntities());
	readonly languageList: Signal<ILanguageEntity[]> = computed(() => this.store.languagesEntities());

	readonly infoMessages: Signal<string | null> = computed(() => this.messages.message());

	displayCountryList: WritableSignal<ICountryEntity[] | null>;
	displayDescriptionCountry: WritableSignal<string | null>;

	addCountryForm: FormGroup | undefined;
	editCountryForm: FormGroup | undefined;
	searchDataForm: FormGroup | undefined;
	private flagImg: File | undefined;
	private dfMainImage: File | undefined;
	private requestData: FormData | undefined;
	private readonly nameProperties: string[];
	private searchList: ICountryEntity[] | undefined;

	private addingCountryDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("addingCountryDialog");

	private updateCountryDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("updateCountryDialog");

	private descriptionDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("descriptionDialog");

	private countryBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> = viewChild<
		ElementRef<HTMLTableSectionElement> | undefined
	>("countryBlock");

	private removeCountryBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
		viewChild<ElementRef<HTMLButtonElement>>("removeCountryBtn");

	private imageCountryDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("imageCountryDialog");

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
			"capitalCity",
			"defaultImage"
		];
	}

	ngOnInit(): void {
		this.createSearchForm();
		this.countryService.setAllCountry();

		if (this.climateList() && this.climateList().length === 0) {
			this.climateService.addingAllClimates();
		}

		if (this.languageList() && this.languageList().length === 0) {
			this.languageService.addingAllLanguages();
		}

		this.creatingAddForm();

		this.onSelectTableRow();
	}

	private setContent(): void {
		effect((): void => {
			if (this.displayCountryList() === null || this.displayCountryList()?.length === 0) {
				this.displayCountryList.set(this.countryList());
				this.loadingFailed.set(false);

				if (this.timerId) {
					window.clearTimeout(this.timerId);
					this.timerId = undefined;
				}
			}

			this.timerId = window.setTimeout(() => {
				this.loadingFailed.set(true);
			}, 30000);
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
				description: new FormControl(this.selectedCountry.description),
				climate: new FormControl<IClimateEntity | null>(this.selectedCountry.climate, Validators.required),
				capitalCity: new FormControl(this.selectedCountry.capitalCity.name, Validators.required),
				languages: new FormControl(this.selectedCountry.languages, Validators.required)
			});
		}
	}

	private createSearchForm(): void {
		this.searchDataForm = new FormGroup({
			search_text: new FormControl("", Validators.required),
			search_option: new FormControl("", Validators.required)
		});
	}

	onSelectedFile(event: Event): void {
		const element = event.target as HTMLInputElement;
		if (element && element.files && element.files.length > 0) {
			this.flagImg = element.files[0];
		} else {
			this.flagImg = undefined;
		}
	}

	onSelectedMainImage(event: Event): void {
		const element = event.target as HTMLInputElement;

		if (element && element.files && element.files.length > 0) {
			this.dfMainImage = element.files[0];
		} else {
			this.dfMainImage = undefined;
		}
	}

	private onSelectTableRow(): void {
		if (this.countryBlock()?.nativeElement && !this.isSelectedRow) {
			this.render.listen(this.countryBlock()!.nativeElement, "click", (e: Event) => {
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

							if (this.removeCountryBtn()?.nativeElement) {
								this.render.listen(this.removeCountryBtn()!.nativeElement, "click", () => {
									if (this.selectedCountry?.id) {
										this.deleteCountry(this.selectedCountry?.id);
										this.selectedCountry = undefined;
										this.isSelectedRow = false;
										this.render.setProperty(this.countryBlock()!.nativeElement, "checked", false);
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
				defaultImage: this.dfMainImage,
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
					defaultImage: this.dfMainImage,
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
				this.flagImg = undefined;
			}
			if (this.dfMainImage) {
				this.requestData.append(this.nameProperties[10], country.defaultImage!, country.defaultImage?.name);
				this.dfMainImage = undefined;
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

			this.countryService.addingCountry(this.requestData).then((result: ICountryEntity | null): void => {
				if (result !== null) {
					const tmp: ICountryEntity[] = this.displayCountryList() || [];
					tmp.push(result);
					this.displayCountryList.set(tmp);

					this.messages.setMessage("Country created");
				} else {
					this.messages.setMessage("Country not created");
				}
			});
		} else {
			this.messages.setMessage("Missing data to send");
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
				this.flagImg = undefined;
			}
			if (this.dfMainImage) {
				this.requestData.append(this.nameProperties[10], country.defaultImage!, country.defaultImage?.name);
				this.dfMainImage = undefined;
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

			this.countryService.updateCountry(this.requestData).then((result: ICountryEntity | null): void => {
				if (result !== null) {
					this.displayCountryList.update((n: ICountryEntity[] | null): ICountryEntity[] | null => {
						if (n !== null) {
							const index = n.findIndex((c: ICountryEntity): boolean => c.id === result.id);

							if (index !== -1) {
								n[index] = result;
								this.selectedCountry = result;
							}
						}

						return n;
					});

					this.messages.setMessage("Country updated");
				} else {
					this.messages.setMessage("Country not updated");
				}
			});

			this.dfMainImage = undefined;
			this.flagImg = undefined;
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
			if (this.descriptionDialog()?.nativeElement) {
				this.descriptionDialog()?.nativeElement.showModal();
			}
		}
	}

	showMessage(): void {
		effect(() => {
			if (this.infoMessages() !== null) {
				this.toastBar.show(this.infoMessages()!.toString(), {
					theme: "snackbar",
					duration: 3500,
					position: "bottom-center",
					autoClose: true,
					style: {
						"border-radius": "30px"
					}
				});
			}
		});
	}

	openAddCountryModal(): void {
		if (this.addingCountryDialog()?.nativeElement) {
			this.addingCountryDialog()?.nativeElement.showModal();
		}
	}

	openUpdateCountryModal(): void {
		if (this.updateCountryDialog()?.nativeElement) {
			this.updateCountryDialog()?.nativeElement.showModal();
		}
	}

	openMainImageModal(): void {
		if (this.imageCountryDialog()?.nativeElement) {
			this.imageCountryDialog()?.nativeElement.showModal();
		}
	}

	closeAddCountryModal(): void {
		if (this.addingCountryDialog()?.nativeElement) {
			this.addingCountryDialog()?.nativeElement.close();
		}
	}

	closeUpdateCountryModal(): void {
		if (this.updateCountryDialog()?.nativeElement) {
			this.updateCountryDialog()?.nativeElement.close();
		}
	}

	closeDescriptionModal(): void {
		if (this.descriptionDialog()?.nativeElement) {
			this.descriptionDialog()?.nativeElement.close();
		}
	}

	closeImageModal(): void {
		if (this.imageCountryDialog()?.nativeElement) {
			this.imageCountryDialog()?.nativeElement.close();
		}
	}

	private deleteCountry(id: number): void {
		this.countryService.deleteCountry(id).then((result: boolean): void => {
			if (result) {
				this.store.removeCountry(id);
				if (this.displayCountryList() !== null && this.displayCountryList()!.length > 0) {
					const tmp: ICountryEntity[] = this.displayCountryList()!;
					for (let i: number = 0; i < tmp.length; i++) {
						if (tmp[i].id === id) {
							tmp.splice(i, 1);
							break;
						}
					}
					this.displayCountryList.set(tmp);
				}
				this.displayCountryList.set(this.countryList());
				this.messages.setMessage("Country deleted");
			}
		});
	}

	searchData(): void {
		if (this.searchDataForm) {
			const values = this.searchDataForm.value;

			if (values && values.search_option && values.search_text) {
				try {
					const text: string = values.search_text as string;
					const option: string = values.search_option as string;

					if (option === "country" && text.trim() !== "") {
						this.searchList = this.countryList().filter((vl: ICountryEntity): boolean => {
							return vl.name.toLowerCase().includes(text.toLowerCase().trim());
						});
					}

					if (option === "capital" && text.trim() !== "") {
						this.searchList = this.countryList().filter((vl: ICountryEntity): boolean => {
							return vl.capitalCity.name.toLowerCase().includes(text.toLowerCase().trim());
						});
					}

					if (this.searchList && this.searchList.length > 0) {
						this.displayCountryList.set(this.searchList);
					}
				} catch (e) {
					this.toastBar.show("Something seems to be wrong here", {
						theme: "snackbar",
						duration: 3500,
						position: "bottom-center",
						autoClose: true,
						style: {
							"border-radius": "30px",
							"max-width": "300px"
						}
					});
				}
			}
		}
	}

	clearSearch(): void {
		this.searchDataForm?.reset();
		this.searchList = undefined;
		this.displayCountryList.set(this.countryList());
	}
}
