import { Component, computed, inject, OnInit, Renderer2, Signal } from "@angular/core";
import { EntityStoragePr2 } from "../../../storage/entity.storage.pr2";
import { HotelService } from "../../../services/Hotels/hotel.service";
import { MessageService } from "../../../services/message.service";
import { HotToastService } from "@ngxpert/hot-toast";
import { IAdminHotelEntity } from "../../../interfaces/hotels-block/i-admin-hotel.entity";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ITagEntity } from "../../../interfaces/hotels-block/i-tag.entity";
import { IMinCountryEntity } from "../../../interfaces/country-block/i-min-country.entity";
import { IMinCityEntity } from "../../../interfaces/country-block/i-min-city.entity";
import { EntityStorage } from "../../../storage/entity.storage";
import { UserService } from "../../../services/user.service";
import { UserRoles } from "../../enums/user-roles";
import { IMinUser } from "../../../interfaces/i-min-user";
import { IRole } from "../../../interfaces/i-role";
import { RoleService } from "../../../services/role.service";

@Component({
	selector: "app-hotel-management",
	imports: [],
	providers: [HotelService, MessageService, UserService, RoleService],
	templateUrl: "./hotel-management.component.html",
	styleUrl: "./hotel-management.component.css"
})
export class HotelManagementComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	private readonly storPr2 = inject(EntityStoragePr2);
	private readonly toast: HotToastService = inject(HotToastService);

	private isSelectedHotel: boolean;
	private username: string;
	private roles: string[];
	private role: IRole | undefined;
	private isAdmin: boolean;
	private isManager: boolean;
	private selectedHotel: IAdminHotelEntity | undefined;
	private managers: IMinUser[] | undefined;
	private currentUser: IMinUser | undefined;

	private hotels: Signal<IAdminHotelEntity[]> = computed((): IAdminHotelEntity[] => this.storPr2.adminHotelsEntities());
	private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());

	protected addForm: FormGroup | undefined;
	protected editForm: FormGroup | undefined;
	protected cityImage: File[] | null;

	constructor(
		private hotelService: HotelService,
		private message: MessageService,
		private userService: UserService,
		private roleService: RoleService,
		private render: Renderer2
	) {
		this.isSelectedHotel = false;
		this.isAdmin = false;
		this.isManager = false;
		this.cityImage = null;
		this.username = this.store.username().trim();
		this.roles = this.store.roles();
	}

	ngOnInit(): void {
		this.checkUser();
		this.hotelService.getAllHotelToAdmin();
		this.createAddForm();
		this.createEditForm();
		this.loadingUsersByRoleManager();
		this.loadingCurrentUser();
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

	private createAddForm(): void {
		this.addForm = new FormGroup({
			hotelName: new FormControl("", Validators.required),
			rate: new FormControl("", Validators.required),
			description: new FormControl("", Validators.required),
			address: new FormControl("", Validators.required),
			tags: new FormControl<ITagEntity[] | null>(null, Validators.required),
			country: new FormControl<IMinCountryEntity | null>(null, Validators.required),
			city: new FormControl<IMinCityEntity | null>(null, Validators.required)
		});
	}

	protected addingHotel(): void {
		if (this.addForm) {
			const data = this.addForm.value;

			if (data) {
				const newHotel: FormData = new FormData();
				newHotel.append("hotelName", data.hotelName);
				newHotel.append("rate", data.rate);
				newHotel.append("description", data.description);
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
						this.hotelService.getHotelById(id);
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
		}
	}

	openAddModal(): void {
		if (this.isAdmin && this.isManager) {
			if (this.addForm && this.currentUser) {
				this.addForm.addControl("manager", new FormControl<IMinUser | null>(this.currentUser, Validators.required));
			}
		}

		if (this.isAdmin && !this.isManager) {
			if (this.addForm) {
				this.addForm.addControl("manager", new FormControl<IMinUser | null>(null, Validators.required));
			}
		}
	}

	private checkUser(): void {
		if (this.username === "") {
			window.location.href = "/login";
		}

		this.roles.forEach((role: string) => {
			if (role.toUpperCase() === UserRoles.MANAGER.toUpperCase()) {
				this.isManager = true;
			} else if (role.toUpperCase() === UserRoles.ADMIN.toUpperCase()) {
				this.isAdmin = true;
			} else {
				window.location.href = "/forbidden";
			}
		});
	}

	private loadingUsersByRoleManager(): void {
		this.roleService.getRoleByName(UserRoles.MANAGER).then((role: IRole | undefined): void => {
			this.role = role;
		});

		if (this.role) {
			this.userService.loadingAllManagers(this.role.id).then((mn: IMinUser[] | undefined): void => {
				if (mn) {
					this.managers = mn;
				}
			});
		}
	}

	private loadingCurrentUser(): void {
		this.userService.loadingMinUserByUsername(this.username).then((user: IMinUser | undefined): void => {
			this.currentUser = user;
		});
	}
}
