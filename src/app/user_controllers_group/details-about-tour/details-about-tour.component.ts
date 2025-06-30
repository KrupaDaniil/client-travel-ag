import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { TourService } from "../../../services/tour.service";
import { ITourDetail } from "../../../interfaces/tour-block/i-tour-detail";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { LoadingComponent } from "../../loading/loading.component";
import { BarRating } from "ngx-bar-rating";
import { OrderTourService } from "../../../services/order-tour.service";
import { EntityStorage } from "../../../storage/entity.storage";
import { ICreateOrderTour } from "../../../interfaces/tour-block/i-create-order-tour";
import { EntityStoragePr2 } from "../../../storage/entity.storage.pr2";
import { IOrderTour } from "../../../interfaces/tour-block/i-order-tour";
import { StatisticService } from "../../../services/statistic.service";
import { CreateHotToastRef, HotToastService } from "@ngxpert/hot-toast";
import { LocalConstants } from "../../enums/local-constants";

@Component({
	selector: "app-details-about-tour",
	imports: [CommonModule, LoadingComponent, BarRating],
	providers: [TourService, OrderTourService],
	templateUrl: "./details-about-tour.component.html",
	styleUrl: "./details-about-tour.component.css"
})
export class DetailsAboutTourComponent implements OnInit {
	private route: ActivatedRoute = inject(ActivatedRoute);
	private store = inject(EntityStorage);
	private storePr2 = inject(EntityStoragePr2);
	private readonly toast: HotToastService = inject(HotToastService);

	protected readonly tourInfo: WritableSignal<ITourDetail | null> = signal<ITourDetail | null>(null);
	private params: Signal<Params | undefined> = toSignal<Params | undefined>(this.route.params);

	private tourId: Signal<number> = computed((): number => {
		if (this.params()) {
			const result: number = Number.parseInt(this.params()!["id"] ?? "");
			return Number.isNaN(result) ? -1 : result;
		} else {
			return -1;
		}
	});

	private timerId: number | undefined;
	protected errorLoading: WritableSignal<boolean> = signal<boolean>(false);

	constructor(
		private tourService: TourService,
		private router: Router,
		private orderService: OrderTourService,
		private stService: StatisticService
	) {
		this.setTour();
	}

	ngOnInit(): void {}

	private setTour(): void {
		effect((): void => {
			if (this.tourId() !== -1 && this.tourInfo() === null) {
				this.tourService.getDetailTour(this.tourId()).then((r: ITourDetail | undefined): void => {
					if (r) {
						this.tourInfo.set(r);
						if (this.timerId) {
							window.clearTimeout(this.timerId);
							this.timerId = undefined;
						}
					}
				});
			}
		});

		this.timerId = window.setTimeout((): void => {
			this.errorLoading.set(true);
		}, 35000);
	}

	private setUserUrl(): void {
		const maxTime: number = 5 * 60 * 1000;

		const url: string = this.router.url;
		if (url !== "") {
			localStorage.setItem(LocalConstants.L_URL, url);

			window.setTimeout((): void => {
				localStorage.removeItem(LocalConstants.L_URL);
			}, maxTime);
		}
	}

	private checkUser(): boolean {
		if (this.store.username() === "") {
			this.setUserUrl();
			this.router.navigate(["/authorization"]);
			return false;
		} else {
			return true;
		}
	}

	protected createOrderTour(): void {
		if (this.tourInfo() !== null && this.checkUser()) {
			const order: ICreateOrderTour = {
				startDate: this.tourInfo()!.dateStart,
				endDate: this.tourInfo()!.dateEnd,
				price: this.tourInfo()!.price,
				tourId: this.tourInfo()!.id,
				username: this.store.username()
			} as ICreateOrderTour;
			const ref: CreateHotToastRef<unknown> = this.toast.loading("Завантаження...", this.getPr());

			this.orderService.addOrderTour(order).then((r: IOrderTour | undefined): void => {
				ref.close();
				if (r) {
					if (this.storePr2.orderToursEntities().length > 0) {
						this.storePr2.setOrderTour(r);
					}

					this.stService.countTBUp(this.tourInfo()!.id);
					this.toast.success("Тур заброньовано", this.getPr());
				} else {
					this.toast.error("Помилка бронювання", this.getPr());
				}
			});
		}
	}

	protected convertDate(date: string | Date): string {
		const currentDate: Date = new Date(date);
		const month: number = currentDate.getMonth() + 1;

		return `${currentDate.getDate().toString().padStart(2, "0")}.${month
			.toString()
			.padStart(2, "0")}.${currentDate.getFullYear()}`;
	}

	private getPr(): Object {
		return {
			theme: "snackbar",
			duration: 5000,
			autoClose: true,
			dismissible: true,
			position: "bottom-center",
			style: {
				"border-radius": "30px"
			}
		};
	}
}
