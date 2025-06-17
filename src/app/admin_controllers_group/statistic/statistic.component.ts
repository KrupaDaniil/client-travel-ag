import {Component, computed, effect, inject, OnInit, Signal} from '@angular/core';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {StatisticService} from '../../../services/statistic.service';
import {NgApexchartsModule} from 'ng-apexcharts';
import {IStatisticHotel} from '../../../interfaces/statistic-block/i-statistic-hotel';
import {IChartOptions} from '../../../interfaces/statistic-block/i-chart-options';
import {IStatisticTour} from '../../../interfaces/statistic-block/i-statistic-tour';

@Component({
  selector: 'app-statistic',
  imports: [NgApexchartsModule],
  providers: [StatisticService],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.css'
})
export class StatisticComponent implements OnInit {
  private readonly store = inject(EntityStoragePr2);

  protected hotelBookingList: Signal<IStatisticHotel[]> =
    computed((): IStatisticHotel[] => this.store.hotelStatisticsEntities());
  protected tourBookingList: Signal<IStatisticTour[]> =
    computed((): IStatisticTour[] => this.store.tourStatisticsEntities());

  protected chartOptionsHotel: Partial<IChartOptions>;
  protected chartOptionsTour: Partial<IChartOptions>;

  constructor(private stService: StatisticService) {
    this.chartOptionsHotel = this.getChartOptions();
    this.chartOptionsTour = this.getChartOptions();
    this.setStHotelInfo();
    this.setStTourInfo();
  }

  ngOnInit(): void {
    this.initBookingLists();
  }

  private initBookingLists(): void {
    if (this.hotelBookingList() && this.hotelBookingList().length === 0) {
      this.stService.setAllHotelBookings();
    }

    if (this.tourBookingList() && this.tourBookingList().length === 0) {
      this.stService.setAllTourBookings();
    }
  }

  private setStHotelInfo(): void {
    effect(() => {
      if (this.hotelBookingList() && this.hotelBookingList().length > 0) {
        let names: string[] = [];
        let amounts: number[] = [];
        let full: number = 0;

        for (const hotelBooking of this.hotelBookingList()) {
          names.push(hotelBooking.hotel.hotelName)
          amounts.push(hotelBooking.amount)
          if (full === 0) {
            full = hotelBooking.amount;
          } else {
            full += hotelBooking.amount;
          }
        }

        if (this.chartOptionsHotel) {
          this.chartOptionsHotel.series = amounts;
          this.chartOptionsHotel.labels = names;
          this.chartOptionsHotel.plotOptions!.radialBar!.dataLabels!.total!.formatter = () => full.toString();
        }
      }
    });
  }

  private setStTourInfo(): void {
    effect(() => {
      if (this.tourBookingList() && this.tourBookingList().length > 0) {
        let names: string[] = [];
        let amounts: number[] = [];
        let full: number = 0;

        for (const tourBooking of this.tourBookingList()) {
          names.push(tourBooking.tour.name);
          amounts.push(tourBooking.amount);

          if (full === 0) {
            full = tourBooking.amount;
          } else {
            full += tourBooking.amount;
          }
        }

        if (this.chartOptionsTour) {
          this.chartOptionsTour.series = amounts;
          this.chartOptionsTour.labels = names;
          this.chartOptionsTour.plotOptions!.radialBar!.dataLabels!.total!.formatter = () => full.toString();
        }
      }
    })
  }


  private getChartOptions(): Object {
    return {
      series: [],
      chart: {
        height: 700,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px"
            },
            value: {
              fontSize: "16px",
              formatter: function (val: number) {
                return Math.round(val).toString() + " bookings"
              }
            },
            total: {
              show: true,
              label: "Total",
              formatter: () => "0"
            },
          }
        }
      },
      labels: []
    }
  }

}
