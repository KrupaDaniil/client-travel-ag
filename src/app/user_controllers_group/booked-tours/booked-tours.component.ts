import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from "@angular/core";
import { OrderTourService } from "../../../services/order-tour.service";
import { EntityStoragePr2 } from "../../../storage/entity.storage.pr2";
import { IOrderTour } from "../../../interfaces/tour-block/i-order-tour";
import { EntityStorage } from "../../../storage/entity.storage";
import { Router } from "@angular/router";
import { LocalConstants } from "../../enums/local-constants";
import { HotToastService } from "@ngxpert/hot-toast";
import { CommonModule } from "@angular/common";
import { LoadingComponent } from "../../loading/loading.component";

@Component({
	selector: "app-booked-tours",
	imports: [CommonModule, LoadingComponent],
	templateUrl: "./booked-tours.component.html",
	styleUrl: "./booked-tours.component.css",
	standalone: true
})
export class BookedToursComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	private readonly store2 = inject(EntityStoragePr2);
	private toast: HotToastService = inject(HotToastService);
	protected tours: Signal<IOrderTour[]> = computed((): IOrderTour[] => this.store2.orderToursEntities());
	private readonly username: string;
	protected loadingFailed: WritableSignal<boolean> = signal<boolean>(false);

	constructor(private orderService: OrderTourService, private router: Router) {
		this.username = this.store.username();
	}

	ngOnInit(): void {
		this.initTours();
	}

	initTours(): void {
		if (this.username === "") {
			localStorage.setItem(LocalConstants.L_URL, this.router.url);
			this.router.navigate(["/authorization"]);
		} else {
			if (this.tours.length === 0) {
				this.orderService.getAllOrderTours(this.username).then((r: IOrderTour[] | undefined): void => {
					if (r) {
						console.log(r);
						this.store2.setAllOrderTour(r);
						this.loadingFailed.set(false);
					} else {
						this.toast.error("Помилка завантаження", this.getPrObj());
						this.loadingFailed.set(true);
					}
				});
			}
		}
	}

	canceledTour(event: Event): void {
		const element = event.target as HTMLButtonElement;
		const trId: string | undefined = element.dataset["orderId"];

		if (trId) {
			const id: number = Number.parseInt(trId);
			console.log(id);
			this.orderService.canceledOrderTour(id).then((r: IOrderTour | undefined): void => {
				if (r) {
					this.store2.setOrderTour(r);
					this.toast.success("Бронювання скасовано", this.getPrObj());
				} else {
					this.toast.error("Помилка скасування", this.getPrObj());
				}
			});
		}
	}

	private getPrObj(): Object {
		return {
			theme: "snackbar",
			position: "bottom-center",
			autoClose: true,
			duration: 5000,
			style: {
				"border-radius": "30px"
			}
		};
	}

	protected convertDate(date: string | Date): string {
		const dt: Date = new Date(date);
		const month: string = (dt.getMonth() + 1).toString().padStart(2, "0");

		return `${dt.getDate().toString().padStart(2, "0")}.${month}.${dt.getFullYear()}`;
	}
}
