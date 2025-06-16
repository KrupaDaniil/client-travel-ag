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
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {HotToastService} from "@ngxpert/hot-toast";
import {EntityStoragePr2} from "../../../storage/entity.storage.pr2";
import {IMinHotel} from "../../../interfaces/hotels-block/i-min-hotel";
import {FoodTypeService} from "../../../services/Hotels/food-type.service";
import {MessageService} from "../../../services/message.service";
import {RoomTypeService} from "../../../services/Hotels/room-type.service";
import {IAdminFoodType} from "../../../interfaces/hotels-block/i-admin-food-type";
import {IFoodTypeCreateEntity} from "../../../interfaces/hotels-block/i-food-type-create.entity";
import {IFoodUpdate} from "../../../interfaces/hotels-block/i-food-update";
import {NgIf} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";

@Component({
  selector: "app-food-type-management",
  imports: [NgIf, NgSelectModule, ReactiveFormsModule],
  providers: [FoodTypeService, RoomTypeService, MessageService],
  templateUrl: "./food-type-management.component.html",
  styleUrl: "./food-type-management.component.css"
})
export class FoodTypeManagementComponent implements OnInit {
  private readonly _storePr2 = inject(EntityStoragePr2);
  private readonly _toast: HotToastService = inject(HotToastService);

  protected foods: Signal<IAdminFoodType[]> = computed((): IAdminFoodType[] => this._storePr2.foodTypesEntities());
  private infoMessage: Signal<string | null> = computed((): string | null => this.message.message());
  private _selectedFood: IAdminFoodType | undefined;
  protected hotels: WritableSignal<IMinHotel[] | undefined> = signal<IMinHotel[] | undefined>(undefined);
  protected loadingFailed: WritableSignal<boolean> = signal<boolean>(false);
  private isSelectedRow: boolean;

  protected addFoodForm: FormGroup | undefined;
  protected editFoodForm: FormGroup | undefined;

  private foodTypeBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
    viewChild<ElementRef<HTMLTableSectionElement>>("FTBlock");
  private removeBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
    viewChild<ElementRef<HTMLButtonElement>>("removeFTBtn");

  private addDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
    viewChild<ElementRef<HTMLDialogElement>>("addFoodTypeDialog");

  private editDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
    viewChild<ElementRef<HTMLDialogElement>>("editFoodTypeDialog");

  constructor(
    private foodService: FoodTypeService,
    private rm: RoomTypeService,
    private message: MessageService,
    private render: Renderer2
  ) {
    this.isSelectedRow = false;
    this.showMessage();
    this.setLoadingFailed();
  }

  ngOnInit(): void {
    this.foodService.setAllFoodTypes();
    this.initHotelList();
    this.createAddFoodForm();
    this.onSelectedRow();
  }

  private initHotelList(): void {
    this.rm.getAllMinHotels().subscribe({
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
        if (this.foods() && this.foods().length > 0) {
          this.loadingFailed.set(false);
        } else {
          this.loadingFailed.set(true);
        }
      }, 30000);
    });
  }

  private onSelectedRow(): void {
    if (this.foodTypeBlock()?.nativeElement && !this.isSelectedRow) {
      this.render.listen(this.foodTypeBlock()!.nativeElement, "click", (e: Event) => {
        const t = e.target as HTMLElement;
        if (t.tagName.toLowerCase() === "td") {
          const r = t.closest("tr") as HTMLTableRowElement;
          if (r) {
            const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
            if (radio) {
              this.render.setProperty(radio, "checked", true);
            }

            const foodId: number = Number.parseInt(r.dataset["foodTypeId"] as string);

            this.foods()!.forEach((food: IAdminFoodType): void => {
              if (food.id === foodId) {
                this._selectedFood = food;
                return;
              }
            });

            if (this._selectedFood) {
              if (!this.editFoodForm) {
                this.createEditFoodForm();
              }

              if (this.removeBtn()?.nativeElement) {
                this.render.listen(this.removeBtn()!.nativeElement, "click", () => {
                  if (this._selectedFood?.id) {
                    this.deleteFoodType(this._selectedFood?.id);
                    this._selectedFood = undefined;
                    this.isSelectedRow = false;
                    this.render.setProperty(this.foodTypeBlock()!.nativeElement, "checked", false);
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

  private createAddFoodForm(): void {
    this.addFoodForm = new FormGroup({
      name: new FormControl("", {validators: [Validators.required], updateOn: "blur"}),
      price: new FormControl("", {
        validators: [Validators.required, Validators.min(1)],
        updateOn: "blur"
      }),
      hotel: new FormControl<IMinHotel | null>(null, {validators: [Validators.required], updateOn: "blur"})
    });
  }

  protected addFoodType(): void {
    if (this.addFoodForm?.valid) {
      const values = this.addFoodForm?.value;

      if (values) {
        const foodType: IFoodTypeCreateEntity = {
          name: values.name,
          price: values.price,
          hotel: values.hotel
        } as IFoodTypeCreateEntity;

        this.foodService.addFoodType(foodType);
      }
    }
  }

  private createEditFoodForm(): void {
    if (this._selectedFood) {
      this.editFoodForm = new FormGroup({
        id: new FormControl(this._selectedFood.id),
        name: new FormControl(
          {value: this._selectedFood.name, disabled: true},
          {validators: [Validators.required], updateOn: "blur"}
        ),
        price: new FormControl<number>(this._selectedFood.price, {
          validators: [Validators.required, Validators.min(1)],
          updateOn: "blur"
        }),
        hotel: new FormControl<IMinHotel | null>(
          {value: this._selectedFood.hotel, disabled: true},
          {
            validators: [Validators.required],
            updateOn: "blur"
          }
        )
      });
    }
  }

  protected editFoodType(): void {
    if (this.editFoodForm?.valid) {
      const values = this.editFoodForm?.value;

      if (values) {
        const editFood: IFoodUpdate = {
          id: values.id,
          price: values.price
        } as IFoodUpdate;

        this.foodService.editFoodType(editFood);
      }
    }
  }

  private deleteFoodType(id: number): void {
    this.foodService.removeFoodType(id);
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
