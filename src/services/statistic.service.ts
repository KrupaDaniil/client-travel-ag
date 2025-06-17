import {inject, Injectable} from '@angular/core';
import {EntityStoragePr2} from '../storage/entity.storage.pr2';
import {HttpService} from './http.service';
import {MessageService} from './message.service';
import {ValidationService} from './validation.service';
import {IStatisticHotel} from '../interfaces/statistic-block/i-statistic-hotel';
import {IError} from '../interfaces/i-error';
import {IStatisticTour} from '../interfaces/statistic-block/i-statistic-tour';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private readonly store = inject(EntityStoragePr2);

  constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {
  }

  setAllHotelBookings(): void {
    this.http_s.loadingAllHotelBooking().subscribe({
      next: (item: IStatisticHotel[] | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setAllHotelBooking(item as IStatisticHotel[]);
        }
      }
    })
  }

  setAllTourBookings(): void {
    this.http_s.loadingAllTourBooking().subscribe({
      next: (item: IStatisticTour[] | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setAllTourBooking(item as IStatisticTour[]);
        }
      }
    })
  }

  countHBUp(hotelId: number): void {
    this.http_s.addBookingHotel(hotelId).subscribe({
      next: (item: IStatisticHotel | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setHotelBk(item as IStatisticHotel);
        }
      }
    })
  }

  countTBUp(tourId: number): void {
    this.http_s.addBookingTour(tourId).subscribe({
      next: (item: IStatisticTour | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setTourBk(item as IStatisticTour);
        }
      }
    })
  }

  countHBDown(hotelId: number): void {
    this.http_s.rdBookingHotel(hotelId).subscribe({
      next: (item: IStatisticHotel | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setHotelBk(item as IStatisticHotel);
        }
      }
    })
  }

  countTBDown(tourId: number): void {
    this.http_s.rdBookingTour(tourId).subscribe({
      next: (item: IStatisticTour | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setTourBk(item as IStatisticTour);
        }
      }
    })
  }
}
