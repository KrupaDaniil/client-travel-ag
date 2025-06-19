import { inject, Injectable } from "@angular/core";
import { EntityStoragePr2 } from "../storage/entity.storage.pr2";
import { HttpService } from "./http.service";
import { MessageService } from "./message.service";
import { ValidationService } from "./validation.service";
import { IAdminTour } from "../interfaces/tour-block/i-admin-tour";
import { IError } from "../interfaces/i-error";
import { map, Observable, of, switchMap } from "rxjs";
import { IMinCountryEntity } from "../interfaces/country-block/i-min-country.entity";
import { IMinCityEntity } from "../interfaces/country-block/i-min-city.entity";
import { IMinHotel } from "../interfaces/hotels-block/i-min-hotel";
import { IMinUser } from "../interfaces/i-min-user";
import { UserRoles } from "../app/enums/user-roles";
import { IRole } from "../interfaces/i-role";

@Injectable({
	providedIn: "root"
})
export class TourService {
	private readonly storePr2 = inject(EntityStoragePr2);

	constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {}

	setAllAdminTour(): void {
		this.http_s.loadingAllToursToAdmin().subscribe({
			next: (item: IAdminTour[] | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this.storePr2.setAllAdminTours(item as IAdminTour[]);
				}
			}
		});
	}

	addTour(tour: FormData): Observable<IAdminTour | null> {
		return this.http_s.addTour(tour).pipe(
			map((item: IAdminTour | IError): IAdminTour | null => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return null;
				} else {
					this.message.setMessage(null);
					this.storePr2.setAdminTour(item as IAdminTour);
					return item as IAdminTour;
				}
			})
		);
	}

	updateTour(tour: FormData): Observable<IAdminTour | null> {
		return this.http_s.updateTour(tour).pipe(
			map((item: IAdminTour | IError): IAdminTour | null => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return null;
				} else {
					this.message.setMessage(null);
					this.storePr2.setAdminTour(item as IAdminTour);
					return item as IAdminTour;
				}
			})
		);
	}

	deleteTour(id: number): Observable<boolean> {
		return this.http_s.deleteTour(id).pipe(
			map((item: boolean | IError): boolean => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return false;
				} else {
					if (item) {
						this.message.setMessage(null);
						this.storePr2.removeAdminTour(id);
						return true;
					}
					return false;
				}
			})
		);
	}

	loadingCountryList(): Observable<IMinCountryEntity[] | null> {
		return this.http_s.loadingAllMinCountry().pipe(
			map((item: IMinCountryEntity[] | IError): IMinCountryEntity[] | null => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return null;
				} else {
					this.message.setMessage(null);
					return item as IMinCountryEntity[];
				}
			})
		);
	}

	loadingCityList(id: number): Observable<IMinCityEntity[] | null> {
		return this.http_s.loadingAllCountryMinCities(id).pipe(
			map((item: IMinCityEntity[] | IError): IMinCityEntity[] | null => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return null;
				} else {
					this.message.setMessage(null);
					return item as IMinCityEntity[];
				}
			})
		);
	}

	loadingHotelList(cityId: number): Observable<IMinHotel[] | null> {
		return this.http_s.loadingAllMinHotelsByCityId(cityId).pipe(
			map((item: IMinHotel[] | IError): IMinHotel[] | null => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return null;
				} else {
					this.message.setMessage(null);
					return item as IMinHotel[];
				}
			})
		);
	}

	loadingManagerList(): Observable<IMinUser[] | null> {
		return this.http_s.loadingRoleByName(UserRoles.MANAGER).pipe(
			map((item: IRole | IError): IRole | undefined => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
					return undefined;
				} else {
					this.message.setMessage(null);
					return item as IRole;
				}
			}),
			switchMap((role: IRole | undefined): Observable<IMinUser[] | null> => {
				if (role) {
					return this.http_s.loadingAllManagers(role.id).pipe(
						map((it: IMinUser[] | IError): IMinUser[] | null => {
							if (this.check.isError(it)) {
								this.message.setMessage((it as IError).message);
								return null;
							} else {
								this.message.setMessage(null);
								return it as IMinUser[];
							}
						})
					);
				} else {
					return of(null);
				}
			})
		);
	}
}
