import { inject, Injectable } from "@angular/core";
import { EntityStoragePr2 } from "../../storage/entity.storage.pr2";
import { HttpService } from "../http.service";
import { MessageService } from "../message.service";
import { ValidationService } from "../validation.service";
import { IAdminFoodType } from "../../interfaces/hotels-block/i-admin-food-type";
import { IError } from "../../interfaces/i-error";
import { IFoodTypeCreateEntity } from "../../interfaces/hotels-block/i-food-type-create.entity";
import { IFoodUpdate } from "../../interfaces/hotels-block/i-food-update";

@Injectable({
	providedIn: "root"
})
export class FoodTypeService {
	private readonly _storePr2 = inject(EntityStoragePr2);

	constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {}

	setAllFoodTypes(): void {
		this.http_s.loadingAllFoodTypes().subscribe({
			next: (item: IAdminFoodType[] | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this._storePr2.setAllFoodTypes(item as IAdminFoodType[]);
				}
			}
		});
	}

	addFoodType(item: IFoodTypeCreateEntity): void {
		this.http_s.addFoodType(item).subscribe({
			next: (item: IAdminFoodType | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this._storePr2.setFoodType(item as IAdminFoodType);
				}
			}
		});
	}

	editFoodType(item: IFoodUpdate): void {
		this.http_s.updateFoodType(item).subscribe({
			next: (item: IAdminFoodType | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this._storePr2.setFoodType(item as IAdminFoodType);
				}
			}
		});
	}

	removeFoodType(id: number): void {
		this.http_s.deleteFoodType(id).subscribe({
			next: (item: boolean | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					if (item) {
						this.message.setMessage(null);
						this._storePr2.removeFoodType(id);
					}
				}
			}
		});
	}
}
