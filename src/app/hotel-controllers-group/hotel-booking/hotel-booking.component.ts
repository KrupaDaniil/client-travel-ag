import {Component, Input} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgOptimizedImage} from '@angular/common';
import {OwlDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {StatisticService} from '../../../services/statistic.service';

@Component({
  selector: 'app-hotel-booking',
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    OwlDateTimeModule
  ],
  providers: [StatisticService],
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.css'
})
export class HotelBookingComponent {

  public bookForm: FormGroup = new FormGroup({
    checkin: new FormControl('', [Validators.required]),
    checkout: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    roomType: new FormControl('', [Validators.required]),
    to: new FormControl('', [Validators.required]),
    from: new FormControl('', [Validators.required]),
  });

  protected readonly Array = Array;
  protected readonly indexedDB = indexedDB;

  @Input() hotelId: number | undefined;

  constructor(private stService: StatisticService) {
  }

  protected countApp(): void {
    if (this.hotelId && this.hotelId > 0) {
      this.stService.countHBUp(this.hotelId);
    }
  }
}
