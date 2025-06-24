import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { TourService } from "../../../services/tour.service";
import { ITourDetail } from "../../../interfaces/tour-block/i-tour-detail";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { LoadingComponent } from "../../loading/loading.component";
import { BarRating } from "ngx-bar-rating";

@Component({
	selector: "app-details-about-tour",
	imports: [CommonModule, LoadingComponent, BarRating],
	providers: [TourService],
	templateUrl: "./details-about-tour.component.html",
	styleUrl: "./details-about-tour.component.css"
})
export class DetailsAboutTourComponent implements OnInit {
	private route: ActivatedRoute = inject(ActivatedRoute);

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

	constructor(private tourService: TourService, private router: Router) {
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
		const url: string = this.router.url;
		if (url !== "") {
			localStorage.setItem("lastURL", url);
		}
	}

	protected convertDate(date: string | Date): string {
		const currentDate: Date = new Date(date);
		const month: number = currentDate.getMonth() + 1;

		return `${currentDate.getDate().toString().padStart(2, "0")}.${month
			.toString()
			.padStart(2, "0")}.${currentDate.getFullYear()}`;
	}
}
