import { ElementRef, inject, Injectable, Signal, viewChild } from "@angular/core";
import { EntityStorage } from "../../storage/entity.storage";
import { HttpService } from "../http.service";
import { MessageService } from "../message.service";
import { ValidationService } from "../validation.service";
import { ITagEntity } from "../../interfaces/hotels-block/i-tag.entity";
import { IError } from "../../interfaces/i-error";

@Injectable({
	providedIn: "root"
})
export class TagService {
	private readonly store = inject(EntityStorage);

	constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {}

	setAllTags(): void {
		this.http_s.loadingAllTags().subscribe({
			next: (item: ITagEntity[] | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.message.setMessage(null);
					this.store.setAllTags(item as ITagEntity[]);
				}
			}
		});
	}

	addTag(tag: FormData): void {
		this.http_s.addTag(tag).subscribe({
			next: (item: ITagEntity | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					this.store.setTag(item as ITagEntity);
					this.message.setMessage("Tag successfully added");
				}
			}
		});
	}

	deleteTag(id: number): void {
		this.http_s.deleteTag(id).subscribe({
			next: (item: boolean | IError): void => {
				if (this.check.isError(item)) {
					this.message.setMessage((item as IError).message);
				} else {
					if (item === true) {
						this.message.setMessage(null);
						this.store.removeTags(id);
					}
				}
			}
		});
	}
}
