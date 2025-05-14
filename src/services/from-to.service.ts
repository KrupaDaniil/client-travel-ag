import { inject, Injectable } from "@angular/core";
import { EntityStorage } from "../storage/entity.storage";
import { HttpService } from "./http.service";
import { MessageService } from "./message.service";
import { ValidationService } from "./validation.service";
import { IFromToEntity } from "../interfaces/filters-block/i-from-to.entity";
import { IError } from "../interfaces/i-error";
import { IFromCountryEntity } from "../interfaces/filters-block/i-from-country.entity";

@Injectable({
	providedIn: "root"
})
export class FromToService {
	private readonly store = inject(EntityStorage);

	constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {}

	setAllFromToEntities(): void {
		this.http_s.loadingAllFromToEntities().subscribe({
			next: (entities: IFromToEntity[] | IError): void => this.resultProcessing<IFromToEntity[]>(entities)
		});
	}

	setAllFromToCountries(): void {
		this.http_s.loadingAllFomToCountries().subscribe({
			next: (countries: IFromCountryEntity[] | IError): void => {
				if (this.check.isError(countries)) {
					this.message.setMessage((countries as IError).message);
				} else {
					this.message.setMessage(null);
					this.store.setAllFromToCountries(countries as IFromCountryEntity[]);
				}
			}
		});
	}

	setFromToEntity(fromToEntity: IFromToEntity): void {
		this.http_s.addFromToEntity(fromToEntity).subscribe({
			next: (entity: IFromToEntity | IError): void => this.resultProcessing<IFromToEntity>(entity)
		});
	}

	editFomToEntity(fromToEntity: IFromToEntity): void {
		this.http_s.updateFromToEntity(fromToEntity).subscribe({
			next: (entity: IFromToEntity | IError): void => this.resultProcessing<IFromToEntity>(entity)
		});
	}

	removeFromToEntity(id: number): void {
		this.http_s.deleteFormToEntity(id).subscribe({
			next: (entity: boolean | IError): void => {
				if (this.check.isError(entity)) {
					this.message.setMessage((entity as IError).message);
				} else {
					this.message.setMessage(null);
					this.store.removeFromToEntity(id);
				}
			}
		});
	}

	private resultProcessing<T extends IFromToEntity | IFromToEntity[]>(entity: T | IError): void {
		if (this.check.isError(entity)) {
			this.message.setMessage((entity as IError).message);
		} else {
			this.message.setMessage(null);
			if (Array.isArray(entity)) {
				this.store.setAllFromToEntities(entity as IFromToEntity[]);
			} else {
				this.store.setFromToEntity(entity as IFromToEntity);
			}
		}
	}
}
