import { Component, computed, effect, inject, OnInit, signal, Signal, WritableSignal } from "@angular/core";
import { LoadingComponent } from "../../loading/loading.component";
import { ICardTour } from "../../../interfaces/tour-block/i-card-tour";
import { EntityStoragePr2 } from "../../../storage/entity.storage.pr2";
import { TourService } from "../../../services/tour.service";

@Component({
	selector: "app-main-tours",
	imports: [LoadingComponent],
	templateUrl: "./main-tours.component.html",
	styleUrl: "./main-tours.component.css"
})
export class MainToursComponent implements OnInit {
	private readonly store = inject(EntityStoragePr2);
	protected allTours: Signal<ICardTour[]> = computed((): ICardTour[] => this.store.clientToursEntities());
	protected isLoadingData: WritableSignal<boolean> = signal<boolean>(false);
	private timerId: number | undefined;

	constructor(private tourService: TourService) {
		this.isLoadingStatus();
	}

	ngOnInit(): void {}

	private isLoadingStatus(): void {
		effect(() => {
			this.tourService.setAllClientTour().then(() => {
				this.isLoadingData.set(true);
			});
		});
	}
}
