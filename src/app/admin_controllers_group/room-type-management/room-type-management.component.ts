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
import { RoomTypeService } from "../../../services/hotels/room-type.service";
import { MessageService } from "../../../services/message.service";
import { HotToastService } from "@ngxpert/hot-toast";
import { IAdminRoomType } from "../../../interfaces/hotels-block/i-admin-room-type";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IMinHotel } from "../../../interfaces/hotels-block/i-min-hotel";
import { ValidationService } from "../../../services/validation.service";
import { IRoomTypeCreateEntity } from "../../../interfaces/hotels-block/i-room-type-create.entity";
import { IRoomUpdate } from "../../../interfaces/hotels-block/i-room-update";
import { NgIf } from "@angular/common";
import { NgSelectModule } from "@ng-select/ng-select";

@Component({
	selector: "app-room-type-management",
	imports: [NgIf, NgSelectModule, ReactiveFormsModule],
	providers: [RoomTypeService, MessageService],
	templateUrl: "./room-type-management.component.html",
	styleUrl: "./room-type-management.component.css"
})
export class RoomTypeManagementComponent implements OnInit {
	private readonly _storePr2 = inject(EntityStoragePr2);
	private readonly _toast: HotToastService = inject(HotToastService);

	protected rooms: Signal<IAdminRoomType[]> = computed((): IAdminRoomType[] => this._storePr2.roomTypesEntities());
	private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());
	private _selectedRoom: IAdminRoomType | undefined;
	protected hotels: WritableSignal<IMinHotel[] | undefined> = signal<IMinHotel[] | undefined>(undefined);
	protected loadingFailed: WritableSignal<boolean> = signal<boolean>(false);
	private isSelectedRow: boolean;

	protected addRoomForm: FormGroup | undefined;
	protected editRoomForm: FormGroup | undefined;

	private roomTypeBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
		viewChild<ElementRef<HTMLTableSectionElement>>("RTBlock");
	private removeBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
		viewChild<ElementRef<HTMLButtonElement>>("removeRTBtn");

	private addDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("addRoomTypeDialog");

	private editDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("editRoomTypeDialog");

	constructor(private roomService: RoomTypeService, private message: MessageService, private render: Renderer2) {
		this.isSelectedRow = false;
		this.setLoadingFailed();
		this.showMessage();
	}

	ngOnInit(): void {
		this.roomService.setAllRoomTypes();
		this.initHotelList();
		this.createAddRoomForm();
		this.onSelectedRow();
	}

	private initHotelList(): void {
		this.roomService.getAllMinHotels().subscribe({
			next: (res: IMinHotel[] | undefined): void => {
				if (res && res.length > 0) {
					this.hotels.set(res);
				}
			}
		});
	}

	private setLoadingFailed(): void {
		effect((): void => {
			setTimeout(() => {
				if (this.rooms() && this.rooms().length > 0) {
					this.loadingFailed.set(false);
				} else {
					this.loadingFailed.set(true);
				}
			}, 30000);
		});
	}

	private onSelectedRow(): void {
		if (this.roomTypeBlock()?.nativeElement && !this.isSelectedRow) {
			this.render.listen(this.roomTypeBlock()!.nativeElement, "click", (e: Event) => {
				const t = e.target as HTMLElement;
				if (t.tagName.toLowerCase() === "td") {
					const r = t.closest("tr") as HTMLTableRowElement;
					if (r) {
						const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
						if (radio) {
							this.render.setProperty(radio, "checked", true);
						}

						const roomId: number = Number.parseInt(r.dataset["roomTypeId"] as string);

						this.rooms()!.forEach((room: IAdminRoomType): void => {
							if (room.id === roomId) {
								this._selectedRoom = room;
								return;
							}
						});

						if (this._selectedRoom) {
							this.createEditRoomForm();

							if (this.removeBtn()?.nativeElement) {
								this.render.listen(this.removeBtn()!.nativeElement, "click", () => {
									if (this._selectedRoom?.id) {
										this.deleteRoomType(this._selectedRoom?.id);
										this._selectedRoom = undefined;
										this.isSelectedRow = false;
										this.render.setProperty(this.roomTypeBlock()!.nativeElement, "checked", false);
									}
								});
							}
						}
					}
				}
			});
		}
	}

	private showMessage(): void {
		effect(() => {
			if (this.infoMessage() !== null) {
				this._toast.show(this.infoMessage()!.toString(), {
					theme: "snackbar",
					duration: 5000,
					dismissible: true,
					autoClose: true,
					position: "bottom-center",
					style: {
						"border-radius": "30px"
					}
				});
			}
		});
	}

	private createAddRoomForm(): void {
		this.addRoomForm = new FormGroup({
			name: new FormControl("", { validators: [Validators.required], updateOn: "blur" }),
			price: new FormControl("", {
				validators: [Validators.required, Validators.min(1)],
				updateOn: "blur"
			}),
			maxPeople: new FormControl("", {
				validators: [Validators.required, Validators.min(1)],
				updateOn: "blur"
			}),
			hotel: new FormControl<IMinHotel | null>(null, { validators: [Validators.required], updateOn: "blur" })
		});
	}

	protected addRoomType(): void {
		console.log(this.addRoomForm?.valid);
		if (this.addRoomForm?.valid) {
			console.log("work");
			const values = this.addRoomForm?.value;

			if (values) {
				const roomType: IRoomTypeCreateEntity = {
					name: values.name,
					price: values.price,
					maxPeople: values.maxPeople,
					hotel: values.hotel
				} as IRoomTypeCreateEntity;

				console.log(roomType);

				this.roomService.addRoomType(roomType);
			}
		}
	}

	private createEditRoomForm(): void {
		if (this._selectedRoom) {
			this.editRoomForm = new FormGroup({
				id: new FormControl(this._selectedRoom.id),
				name: new FormControl(
					{ value: this._selectedRoom.name, disabled: true },
					{ validators: [Validators.required], updateOn: "blur" }
				),
				price: new FormControl<number>(this._selectedRoom.price, {
					validators: [Validators.required, Validators.min(1)],
					updateOn: "blur"
				}),
				maxPeople: new FormControl<number>(
					{ value: this._selectedRoom.maxPeople, disabled: true },
					{
						validators: [Validators.required, Validators.min(1)],
						updateOn: "blur"
					}
				),
				hotel: new FormControl<IMinHotel | null>(
					{ value: this._selectedRoom.hotel, disabled: true },
					{
						validators: [Validators.required],
						updateOn: "blur"
					}
				)
			});
		}
	}

	protected editRoomType(): void {
		if (this.editRoomForm?.valid) {
			const values = this.editRoomForm?.value;

			if (values) {
				const editRoom: IRoomUpdate = {
					id: values.id,
					price: values.price
				} as IRoomUpdate;

				this.roomService.editRoomType(editRoom);
			}
		}
	}

	private deleteRoomType(id: number): void {
		this.roomService.removeRooType(id);
	}

	openAddDialog(): void {
		if (this.addDialog()?.nativeElement) {
			this.addDialog()?.nativeElement.showModal();
		}
	}

	openEditDialog(): void {
		if (this.editDialog()?.nativeElement) {
			this.editDialog()?.nativeElement.showModal();
		}
	}

	closeAddDialog(): void {
		if (this.addDialog()?.nativeElement && this.addDialog()?.nativeElement.open) {
			this.addDialog()?.nativeElement.close();
		}
	}

	closeEditDialog(): void {
		if (this.editDialog()?.nativeElement && this.editDialog()?.nativeElement.open) {
			this.editDialog()?.nativeElement.close();
		}
	}
}
