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
	private selectedHotel: IAdminHotelEntity | undefined;

	private hotels: Signal<IAdminHotelEntity[]> = computed((): IAdminHotelEntity[] => this.storPr2.adminHotelsEntities());
	private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());

	protected addForm: FormGroup | undefined;
	protected editForm: FormGroup | undefined;
	protected cityImage: File[] | null;

	constructor(private hotel: HotelService, private message: MessageService, private render: Renderer2) {
		this.isSelectedHotel = false;
		this.cityImage = null;
	}

	ngOnInit(): void {
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
}
