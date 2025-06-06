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
import { IUserInfo } from "../../../interfaces/user-auth/i-user-info";
import { IUser } from "../../../interfaces/i-user";
import { UserRoles } from "../../enums/user-roles";

@Component({
	selector: "app-hotel-management",
	imports: [],
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
	private isAdmin: boolean;
	private selectedHotel: IAdminHotelEntity | undefined;
	private currentUser: IUserInfo | undefined;

	private hotels: Signal<IAdminHotelEntity[]> = computed((): IAdminHotelEntity[] => this.storPr2.adminHotelsEntities());
	private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());

	protected addForm: FormGroup | undefined;
	protected editForm: FormGroup | undefined;
	protected cityImage: File[] | null;

	constructor(
		private hotelService: HotelService,
		private message: MessageService,
		private userService: UserService,
		private render: Renderer2
	) {
		this.isSelectedHotel = false;
		this.isAdmin = false;
		this.cityImage = null;
		this.username = this.store.username().trim();
		this.roles = this.store.roles();
	}

	ngOnInit(): void {
		this.hotelService.getAllHotelToAdmin();
		this.createAddForm();
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
		if (this.username !== "") {
			window.location.href = "/login";
		}

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
					newHotel.append("city", (data.city as IMinCityEntity).id.toString());
				}

				newHotel.append("manager", this.username);

				this.hotelService.createHotel(newHotel).then((id: number | undefined): void => {
					if (id) {
						this.hotelService.getHotelById(id);
					}
				});
			}
		}
	}

	private createEditForm(): void {
		if (this.username === "") {
			window.location.href = "/login";
		}

		this.roles.forEach((role: string): void => {
			if (role.toUpperCase() === UserRoles.MANAGER.toString()) {
				this.isAdmin = true;
			}
		});

		if (this.selectedHotel) {
			this.editForm = new FormGroup({
				id: new FormControl(this.selectedHotel.id),
				hotelName: new FormControl(this.selectedHotel.hotelName, Validators.required),
				rate: new FormControl(this.selectedHotel.rate, Validators.required),
				description: new FormControl(this.selectedHotel.description, Validators.required),
				address: new FormControl(this.selectedHotel.address, Validators.required),
				tags: new FormControl<ITagEntity[] | null>(this.selectedHotel.tags, Validators.required),
				country: new FormControl<IMinCountryEntity | null>(this.selectedHotel.country, Validators.required),
				city: new FormControl<IMinCityEntity | null>(this.selectedHotel.city, Validators.required)
			});
		}
	}
}
