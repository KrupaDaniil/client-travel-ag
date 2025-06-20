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
import { EntityStoragePr2 } from "../../../storage/entity.storage.pr2";
import { MessageService } from "../../../services/message.service";
import { HotToastService } from "@ngxpert/hot-toast";
import { IAdminHotelEntity } from "../../../interfaces/hotels-block/i-admin-hotel.entity";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ITagEntity } from "../../../interfaces/hotels-block/i-tag.entity";
import { IMinCountryEntity } from "../../../interfaces/country-block/i-min-country.entity";
import { IMinCityEntity } from "../../../interfaces/country-block/i-min-city.entity";
import { EntityStorage } from "../../../storage/entity.storage";
import { UserService } from "../../../services/user.service";
import { UserRoles } from "../../enums/user-roles";
import { IMinUser } from "../../../interfaces/i-min-user";
import { IRole } from "../../../interfaces/i-role";
import { RoleService } from "../../../services/role.service";
import { NgIf, NgOptimizedImage } from "@angular/common";
import {
	NgLabelTemplateDirective,
	NgOptionComponent,
	NgOptionTemplateDirective,
	NgSelectComponent
} from "@ng-select/ng-select";
import { TagService } from "../../../services/Hotels/tag.service";
import { CountryService } from "../../../services/country.service";
import { CityService } from "../../../services/city.service";
import { HotelService } from "../../../services/Hotels/hotel.service";
import { BarRating } from "ngx-bar-rating";

@Component({
	selector: "app-hotel-management",
	imports: [
		NgOptimizedImage,
		ReactiveFormsModule,
		NgSelectComponent,
		NgOptionComponent,
		NgOptionTemplateDirective,
		NgLabelTemplateDirective,
		BarRating,
		NgIf
	],
	providers: [HotelService, MessageService, UserService, RoleService, TagService, CountryService, CityService],
	templateUrl: "./hotel-management.component.html",
	styleUrl: "./hotel-management.component.css",
	standalone: true
})
export class HotelManagementComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	private readonly storePr2 = inject(EntityStoragePr2);
	private readonly toast: HotToastService = inject(HotToastService);

	private isSelectedHotel: boolean;
	protected isLoading: WritableSignal<boolean> = signal<boolean>(false);
	protected isLoadingManagers: WritableSignal<boolean> = signal<boolean>(true);
	private readonly username: string;
	private readonly roles: string[];
	protected selectedId: number | undefined;
	protected isAdmin: boolean;
	protected isManager: boolean;
	protected loadingFailed: WritableSignal<boolean>;
	protected selectedHotel: IAdminHotelEntity | undefined;
	protected managers: WritableSignal<IMinUser[] | null> = signal<IMinUser[] | null>(null);
	private currentUser: IMinUser | undefined;
	private timerId: number | undefined;

	private hotels: Signal<IAdminHotelEntity[]> = computed((): IAdminHotelEntity[] => {
		return this.storePr2.adminHotelsEntities();
	});
	private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());
	displayHotels: WritableSignal<IAdminHotelEntity[] | null> = signal<IAdminHotelEntity[] | null>(null);
	tagsList: Signal<ITagEntity[]> = computed((): ITagEntity[] => this.store.tagsEntities());
	countryList: Signal<IMinCountryEntity[]> = computed((): IMinCountryEntity[] => this.storePr2.minCountriesEntities());
	cityList: WritableSignal<IMinCityEntity[] | null> = signal<IMinCityEntity[] | null>(null);

	private hotelBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
		viewChild<ElementRef<HTMLTableSectionElement>>("hotelsBlock");

	private tagsModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("TagsDialog");

	private imageModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("ImageDialog");

	private descriptionModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("DescriptionDialog");

	private removeHotelBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
		viewChild<ElementRef<HTMLButtonElement>>("removeHotelBtn");

	private addHotelModal: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("AddHotelDialog");

	private addHotelForm: Signal<ElementRef<HTMLFormElement> | undefined> =
		viewChild<ElementRef<HTMLFormElement>>("addHotelForm");

	private editDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("EditHotelDialog");

	private editHotelForm: Signal<ElementRef<HTMLFormElement> | undefined> =
		viewChild<ElementRef<HTMLFormElement>>("editHotelForm");

	protected addForm: FormGroup | undefined;
	protected editForm: FormGroup | undefined;
	protected cityImage: File[] | null;
	protected searchDataForm: FormGroup | undefined;

	selectedTags = (f_tag: ITagEntity, l_tag: ITagEntity): boolean => f_tag && l_tag && f_tag.id === l_tag.id;

	constructor(
		private hotelService: HotelService,
		private message: MessageService,
		private userService: UserService,
		private roleService: RoleService,
		private tagService: TagService,
		private countryService: CountryService,
		private cityService: CityService,
		private render: Renderer2
	) {
		this.isSelectedHotel = false;
		this.isAdmin = false;
		this.isManager = false;
		this.loadingFailed = signal<boolean>(false);
		this.cityImage = null;
		this.username = this.store.username().trim();
		this.roles = this.store.roles();
		this.initDisplayList();
		this.showToast();
	}

	ngOnInit(): void {
		this.checkUser();
		this.loadingUsersByRoleManager();
		this.loadingCurrentUser();
		this.onSelectedRow();
		this.initTags();
		this.initCountries();
		this.createAddForm();
		this.createSearchForm();
	}

	private initTags(): void {
		if (this.store.tagsEntities().length === 0) {
			this.tagService.setAllTags();
		}
	}

	private initCountries(): void {
		if (this.storePr2.minCountriesEntities().length === 0) {
			this.countryService.setAllMinCountry();
		}
	}

	private initDisplayList(): void {
		this.hotelService.getAllHotelToAdmin().subscribe({
			next: (r: boolean) => {
				if (r) {
					if (this.timerId) {
						window.clearTimeout(this.timerId);
					}
					this.loadingFailed.set(false);
					this.timerId = undefined;
				} else {
					this.loadingFailed.set(true);
				}
			}
		});

		effect((): void => {
			if (this.displayHotels() === null || this.displayHotels()?.length === 0) {
				this.displayHotels.set(this.hotels());
			}
		});

		this.timerId = window.setTimeout(() => {
			this.loadingFailed.set(true);
		}, 30000);
	}

	private createSearchForm(): void {
		this.searchDataForm = new FormGroup({
			search_text: new FormControl("", Validators.required),
			search_option: new FormControl("", Validators.required)
		});
	}

	selectedManager(item: IMinUser, selected: IMinUser): boolean {
		return item && selected ? item.id === selected.id : item === selected;
	}

	onClearClick(itemToRemove: ITagEntity, event: MouseEvent): void {
		event.preventDefault();
		event.stopImmediatePropagation();

		const control = this.editForm?.get("tags");
		if (!control) return;

		const currentTags = (control.value as ITagEntity[]) || [];
		const updatedTags = currentTags.filter(tag => tag.id !== itemToRemove.id);

		control.setValue(updatedTags);
	}

	private onSelectedRow(): void {
		if (this.hotelBlock()?.nativeElement && !this.isSelectedHotel) {
			this.render.listen(this.hotelBlock()!.nativeElement, "click", (e: Event): void => {
				const h = e.target as HTMLElement;
				if (h.tagName.toLowerCase() === "td") {
					const r = h.closest("tr") as HTMLTableRowElement;
					if (r) {
						const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
						if (radio) {
							this.render.setProperty(radio, "checked", true);
						}

						this.selectedId = Number.parseInt(r.dataset["hotelId"] as string);

						this.displayHotels()!.forEach((hotel: IAdminHotelEntity): void => {
							if (hotel.id === this.selectedId) {
								this.selectedHotel = hotel;
								return;
							}
						});

						if (this.selectedHotel) {
							this.createEditForm();

							if (this.removeHotelBtn()?.nativeElement) {
								this.render.listen(this.removeHotelBtn()!.nativeElement, "click", () => {
									if (this.selectedHotel?.id) {
										this.deleteHotel(this.selectedHotel!.id);
										this.selectedHotel = undefined;
										this.isSelectedHotel = false;
										this.selectedId = undefined;
										this.render.setProperty(this.hotelBlock()!.nativeElement, "checked", false);
									}
								});
							}
						}
					}
				}
			});
		}
	}

	onSelectedFiles(e: Event): void {
		const element = e.target as HTMLInputElement;

		if (element && element.files && element.files.length > 0) {
			this.cityImage = [];

			for (let index: number = 0; index < element.files.length; index++) {
				this.cityImage.push(element.files[index]);
			}
		} else {
			this.cityImage = null;
		}
	}

	private clearAddForm(): void {
		if (this.addHotelForm()?.nativeElement) {
			this.addHotelForm()!.nativeElement.reset();
		}
	}

	private clearEditForm(): void {
		if (this.editHotelForm()?.nativeElement) {
			this.editHotelForm()!.nativeElement.reset();
		}
	}

	onSelectedCountry(country: IMinCountryEntity): void {
		if (country && country.id) {
			this.isLoading.set(true);

			if (this.cityList() && this.cityList()!.length > 0) {
				this.cityList.set(null);
			}

			this.cityService.getAllCountryCities(country.id).then((cities: IMinCityEntity[] | undefined): void => {
				if (cities) {
					this.cityList.set(cities);
					this.isLoading.set(false);
				} else {
					this.cityList.set(null);
					this.isLoading.set(false);
				}
			});
		} else {
			this.cityList.set(null);
		}
	}

	private createAddForm(): void {
		this.addForm = new FormGroup({
			hotelName: new FormControl("", Validators.required),
			rate: new FormControl("", Validators.required),
			description: new FormControl("", Validators.required),
			address: new FormControl("", Validators.required),
			tags: new FormControl<ITagEntity[] | null>(null, Validators.required),
			country: new FormControl<IMinCountryEntity | null>(null, Validators.required),
			city: new FormControl<IMinCityEntity | null>(null, Validators.required),
			manager: new FormControl<IMinUser | null>(null, Validators.required)
		});

		this.enableManagerField();
	}

	protected addingHotel(): void {
		if (this.addForm) {
			const data = this.addForm.value;

			if (data) {
				const newHotel: FormData = new FormData();
				newHotel.append("hotelName", data.hotelName);
				newHotel.append("rate", data.rate);
				newHotel.append("description", data.description.toString());
				newHotel.append("address", data.address);

				if (this.cityImage) {
					this.cityImage.forEach((image: File): void => {
						newHotel.append("images", image);
					});
				}

				if (data.tags && data.tags.length > 0) {
					data.tags.forEach((tag: ITagEntity): void => {
						newHotel.append("tags", tag.id.toString());
					});
				}

				if (data.country) {
					newHotel.append("countryId", (data.country as IMinCountryEntity).id.toString());
				}

				if (data.city) {
					newHotel.append("cityId", (data.city as IMinCityEntity).id.toString());
				}

				if (this.isManager && !this.isAdmin) {
					if (this.currentUser) {
						newHotel.append("managerId", this.currentUser.id.toString());
					}
				} else {
					newHotel.append("managerId", (data.manager as IMinUser).id.toString());
				}

				this.hotelService.createHotel(newHotel).then((id: number | undefined): void => {
					if (id) {
						this.hotelService.getAdminHotelById(id).then((adminHotel: IAdminHotelEntity | null): void => {
							if (adminHotel !== null) {
								this.storePr2.setAdminHotel(adminHotel);

								if (this.displayHotels() !== null) {
									const tmp: IAdminHotelEntity[] = this.displayHotels() || [];
									tmp.push(adminHotel);
									this.displayHotels.set(tmp);
								}

								this.message.setMessage("Hotel added successfully!");
								this.addForm?.reset();
								this.clearAddForm();
								this.cityImage = null;
							} else {
								this.message.setMessage("Failed to add hotel.");
							}
						});
						this.hotelService.setIHotelEntityToStore(id);
					}
				});
			}
		}
	}

	private createEditForm(): void {
		if (this.selectedHotel) {
			this.editForm = new FormGroup({
				id: new FormControl(this.selectedHotel.id),
				hotelName: new FormControl(this.selectedHotel.hotelName, Validators.required),
				rate: new FormControl(this.selectedHotel.rate, Validators.required),
				description: new FormControl(this.selectedHotel.description, Validators.required),
				address: new FormControl(this.selectedHotel.address, Validators.required),
				tags: new FormControl<ITagEntity[] | null>(this.selectedHotel.tags, Validators.required),
				country: new FormControl<IMinCountryEntity | null>(this.selectedHotel.country, Validators.required),
				city: new FormControl<IMinCityEntity | null>(this.selectedHotel.city, Validators.required),
				manager: new FormControl<IMinUser | null>(this.selectedHotel.manager, Validators.required)
			});

			this.enableManagerField();
		}
	}

	protected saveEditHotel(): void {
		if (this.editForm) {
			const data = this.editForm.value;

			if (data) {
				const updatedHotel: FormData = new FormData();
				updatedHotel.append("id", data.id.toString());
				updatedHotel.append("hotelName", data.hotelName);
				updatedHotel.append("rate", data.rate);
				updatedHotel.append("description", data.description.toString());
				updatedHotel.append("address", data.address);

				if (this.cityImage) {
					this.cityImage.forEach((image: File): void => {
						updatedHotel.append("images", image);
					});
				}

				if (data.tags && data.tags.length > 0) {
					data.tags.forEach((tag: ITagEntity): void => {
						updatedHotel.append("tags", tag.id.toString());
					});
				}

				if (data.country) {
					updatedHotel.append("countryId", (data.country as IMinCountryEntity).id.toString());
				}

				if (data.city) {
					updatedHotel.append("cityId", (data.city as IMinCityEntity).id.toString());
				}

				if (this.isManager && !this.isAdmin) {
					if (this.currentUser) {
						updatedHotel.append("managerId", this.currentUser.id.toString());
					}
				} else {
					updatedHotel.append("managerId", (data.manager as IMinUser).id.toString());
				}

				this.hotelService.updateHotel(updatedHotel).then((res: boolean): void => {
					if (res) {
						this.hotelService.getAdminHotelById(data.id).then((adminHotel: IAdminHotelEntity | null): void => {
							if (adminHotel !== null) {
								this.storePr2.setAdminHotel(adminHotel);
								this.displayHotels.update((res: IAdminHotelEntity[] | null): IAdminHotelEntity[] | null => {
									if (res != null) {
										const index: number = res.findIndex((r: IAdminHotelEntity): boolean => r.id === adminHotel.id);

										if (index != -1) {
											res[index] = adminHotel;
										}
									}
									return res;
								});
								this.message.setMessage("Hotel updated successfully!");
								this.editForm?.reset();
								this.clearEditForm();
								this.cityImage = null;
								this.selectedHotel = adminHotel;
							} else {
								this.message.setMessage("Failed to update hotel.");
							}
						});
						this.hotelService.setIHotelEntityToStore(data.id);
					}
				});
			}
		}
	}

	private deleteHotel(id: number): void {
		this.hotelService.removeHotel(id).subscribe({
			next: (r: boolean): void => {
				if (r) {
					if (this.displayHotels() !== null) {
						const tmp: IAdminHotelEntity[] = this.displayHotels()!;
						const index: number = tmp.findIndex((r: IAdminHotelEntity): boolean => r.id === id);
						if (index != -1) {
							tmp.splice(index, 1);
						}

						this.displayHotels.set(tmp);
					}
				}
			}
		});
	}

	private checkUser(): void {
		if (this.username === "") {
			window.location.href = "/login";
			return;
		}

		this.roles.forEach((role: string) => {
			if (role === UserRoles.MANAGER) {
				this.isManager = true;
			}
			if (role === UserRoles.ADMIN) {
				this.isAdmin = true;
			}
		});

		if (!this.isManager && !this.isAdmin) {
			window.location.href = "/forbidden";
		}
	}

	private loadingUsersByRoleManager(): void {
		this.roleService.getRoleByName(UserRoles.MANAGER).then((role: IRole | undefined): void => {
			if (role) {
				this.userService.loadingAllManagers(role.id).then((mn: IMinUser[] | undefined): void => {
					if (mn) {
						this.managers.set(mn);
						this.isLoadingManagers.set(false);
					}
				});
			}
		});
	}

	private loadingCurrentUser(): void {
		this.userService.loadingMinUserByUsername(this.username).then((user: IMinUser | undefined): void => {
			this.currentUser = user;
			if (this.isAdmin && this.isManager) {
				this.addForm?.get("manager")?.setValue(this.currentUser);
			}
		});
	}

	openTagsModal(): void {
		if (this.tagsModal() && this.tagsModal()?.nativeElement) {
			this.tagsModal()!.nativeElement.showModal();
		}
	}

	closeTagsModal(): void {
		if (this.tagsModal() && this.tagsModal()?.nativeElement) {
			if (this.tagsModal()!.nativeElement.open) {
				this.tagsModal()!.nativeElement.close();
			}
		}
	}

	openImageModal(): void {
		if (this.imageModal() && this.imageModal()?.nativeElement) {
			this.imageModal()!.nativeElement.showModal();
		}
	}

	openAddHotelModal(): void {
		if (this.addHotelModal()?.nativeElement) {
			this.addHotelModal()!.nativeElement.showModal();
		}
	}

	openEditModal(): void {
		if (this.editDialog()?.nativeElement) {
			this.editDialog()!.nativeElement.showModal();
		}
	}

	closeImageModal(): void {
		if (this.imageModal() && this.imageModal()?.nativeElement) {
			if (this.imageModal()!.nativeElement.open) {
				this.imageModal()!.nativeElement.close();
			}
		}
	}

	openDescriptionModal(): void {
		if (this.descriptionModal() && this.descriptionModal()?.nativeElement) {
			this.descriptionModal()!.nativeElement.showModal();
		}
	}

	closeDescriptionModal(): void {
		if (this.descriptionModal() && this.descriptionModal()?.nativeElement) {
			if (this.descriptionModal()!.nativeElement.open) {
				this.descriptionModal()!.nativeElement.close();
			}
		}
	}

	closeAddHotelModal(): void {
		if (this.addHotelModal() && this.addHotelModal()?.nativeElement) {
			if (this.addHotelModal()!.nativeElement.open) {
				this.addHotelModal()!.nativeElement.close();
			}
		}
	}

	closeEditModal(): void {
		if (this.editDialog() && this.editDialog()?.nativeElement) {
			if (this.editDialog()!.nativeElement.open) {
				this.editDialog()!.nativeElement.close();
			}
		}
	}

	private showToast(): void {
		effect(() => {
			if (this.infoMessage() !== null) {
				this.toast.show(this.infoMessage()?.toString(), {
					theme: "snackbar",
					duration: 5000,
					position: "bottom-center",
					autoClose: true,
					dismissible: true,
					style: {
						"border-radius": "30px"
					}
				});
			}
		});
	}

	private enableManagerField(): void {
		if (this.isAdmin && this.isManager) {
			this.addForm?.get("manager")?.enable();
		}

		if (this.isAdmin && !this.isManager) {
			this.addForm?.get("manager")?.enable();
		}

		if (!this.isAdmin && this.isManager) {
			this.addForm?.get("manager")?.disable();
		}
	}

	protected searchData(): void {
		if (this.searchDataForm) {
			const values = this.searchDataForm.value;

			if (values && values.search_text && values.search_option) {
				const text: string = values.search_text as string;
				const opt: string = values.search_option as string;
				if (text.trim() !== "") {
					let hotelList: IAdminHotelEntity[] = [];

					if (opt === "hotelName") {
						hotelList = this.hotels().filter((h: IAdminHotelEntity): boolean =>
							h.hotelName.toLowerCase().includes(text.toLowerCase())
						);
					}

					if (opt === "cityName") {
						hotelList = this.hotels().filter((h: IAdminHotelEntity): boolean =>
							h.city.name.toLowerCase().includes(text.toLowerCase())
						);
					}

					if (opt === "countryName") {
						hotelList = this.hotels().filter((h: IAdminHotelEntity): boolean =>
							h.country.name.toLowerCase().includes(text.toLowerCase())
						);
					}

					if (hotelList.length > 0) {
						this.displayHotels.set(hotelList);
					}
				}
			}
		}
	}

	protected clearSearch(): void {
		this.searchDataForm?.reset();
		this.displayHotels.set(this.hotels());
	}
}
