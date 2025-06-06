import { inject, Injectable } from "@angular/core";
import { HttpService } from "../http.service";
import { IHotelEntity } from "../../interfaces/hotels-block/i-hotel.entity";
import { EntityStorage } from "../../storage/entity.storage";
import { EntityStoragePr2 } from "../../storage/entity.storage.pr2";
import { MessageService } from "../message.service";
import { IAdminHotelEntity } from "../../interfaces/hotels-block/i-admin-hotel.entity";
import { IError } from "../../interfaces/i-error";
import { ValidationService } from "../validation.service";
import { firstValueFrom, map } from "rxjs";

@Injectable({
	providedIn: "root"
})
export class HotelService {
	private readonly store = inject(EntityStorage);
	private readonly storePr2 = inject(EntityStoragePr2);

	constructor(private http: HttpService, private message: MessageService, private check: ValidationService) {}

	public getHotelsByCountryId(countryId: number): void {
		this.http.loadingHotelsByCountryId(countryId).subscribe(res => {
			this.store.setAllHotels(res as IHotelEntity[]);
		});
	}

	public getRandomHotelsByCountryId(countryId: number, amount: number): void {
		this.http.loadingRandomHotelsByCountryId(countryId, amount).subscribe(res => {
			this.store.setAllHotels(res as IHotelEntity[]);
		});
	}

	public getTopHotelsByCountryId(countryId: number, amount: number): void {
		this.http.loadingTopHotelsByCountryId(countryId, amount).subscribe(res => {
			this.store.setTopHotels(res as IHotelEntity[]);
		});
	}

	getAllHotelToAdmin(): void {
		this.http.loadingAllHotelToAdmin().subscribe({
			next: (item: IAdminHotelEntity[] | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this.storePr2.setAllAdminHotels(item as IAdminHotelEntity[]);
				}
			}
		});
	}

	async createHotel(hotel: FormData): Promise<number | undefined> {
		return await firstValueFrom(
			this.http.addHotel(hotel).pipe(
				map((item: number | IError): number | undefined => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return undefined;
					} else {
						this.message.setMessage(null);
						return item as number;
					}
				})
			)
		);
	}

	async updateHotel(hotel: FormData): Promise<boolean> {
		return await firstValueFrom(
			this.http.updateHotel(hotel).pipe(
				map((item: boolean | IError): boolean => {
					if (this.check.isError(item)) {
						this.message.setMessage((item as IError).message);
						return false;
					} else {
						this.message.setMessage(null);
						return item as boolean;
					}
				})
			)
		);
	}

	removeHotel(id: number): void {
		this.http.deleteHotel(id).subscribe({
			next: (item: boolean | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage("Hotel deleted successfully");
				}
			}
		});
	}
	public getHotelById(hotelId: number) {
		let tmp = this.store.hotelsEntities().find(hotel => hotel.id === hotelId);
		if (tmp != undefined) {
			console.log("Hotel found in storage");
			return tmp;
		}
		return this.http.loadingHotelById(hotelId);
	}
}
