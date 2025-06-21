import {Component, inject, OnInit} from '@angular/core';
import {StarsComponent} from '../stars/stars.component';
import {EntityStorage} from '../../../storage/entity.storage';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {CountryService} from '../../../services/country.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ValidationService} from '../../../services/validation.service';
import {HotelCarouselComponent} from '../hotel-carousel/hotel-carousel.component';
import {HotelBookingComponent} from '../hotel-booking/hotel-booking.component';
import {LoadingComponent} from '../../loading/loading.component';
import {HotelAboutComponent} from '../hotel-about/hotel-about.component';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';
import {StatisticService} from '../../../services/statistic.service';
import {HotelFeedbackComponent} from '../hotel-feedback/hotel-feedback.component';
import {IHotelFeedbackEntity} from '../../../interfaces/hotels-block/i-hotel-feedback.entity';
import {UserService} from '../../../services/user.service';
import {NgOptimizedImage} from '@angular/common';
import {OwlDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-hotel-details',
  imports: [
    StarsComponent,
    HotelCarouselComponent,
    HotelBookingComponent,
    LoadingComponent,
    HotelAboutComponent,
    HotelFeedbackComponent,
    RouterLink,
    OwlDateTimeModule,
    ReactiveFormsModule,
  ],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.css'
})
export class HotelDetailsComponent implements OnInit {

  protected readonly hotelId: number;
  private store = inject(EntityStorage)
  public hotel?: IHotelDetailsEntity;

  constructor(private service: HotelService, private countryService: CountryService, private route: ActivatedRoute,
              private check: ValidationService, private stService: StatisticService, private userService: UserService) {
    const id = this.route.snapshot.paramMap.get("hotelId");
    this.hotelId = id ? Number(id) : 0;
    console.log("main", this.hotelId);
  }

  ngOnInit(): void {
    this.initHotel();
  }

  private initHotel(): void {
    this.service.getHotelById(this.hotelId).subscribe((res: IHotelDetailsEntity | undefined): void => {
      if (res) {
        this.hotel = res;
        console.log(this.hotel);
      }
    });
  }

  protected countUp(): void {
    if (this.hotelId > 0) {
      this.stService.countHBUp(this.hotelId);
    }
  }


  addFeedback(event: IHotelFeedbackEntity) {
    if(event && this.hotel){
      if(this.hotel.feedbacks.length<2)
        this.hotel.feedbacks.push(event);
      this.hotel.totalFeedbacks++;
    }
  }

}
