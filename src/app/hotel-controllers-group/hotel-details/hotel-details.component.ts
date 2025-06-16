import {Component, inject, OnInit} from '@angular/core';
import {StarsComponent} from '../stars/stars.component';
import {EntityStorage} from '../../../storage/entity.storage';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {CountryService} from '../../../services/country.service';
import {ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../../services/validation.service';
import {HotelCarouselComponent} from '../hotel-carousel/hotel-carousel.component';
import {HotelBookingComponent} from '../hotel-booking/hotel-booking.component';
import {LoadingComponent} from '../../loading/loading.component';
import {HotelAboutComponent} from '../hotel-about/hotel-about.component';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';

@Component({
  selector: 'app-hotel-details',
  imports: [
    StarsComponent,
    HotelCarouselComponent,
    HotelBookingComponent,
    LoadingComponent,
    HotelAboutComponent,
  ],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.css'
})
export class HotelDetailsComponent implements OnInit {

  private readonly hotelId: number;
  private store = inject(EntityStorage)
  public hotel?: IHotelDetailsEntity;

  constructor(private service: HotelService, private countryService: CountryService, private route: ActivatedRoute,
              private check: ValidationService) {
    const id = this.route.snapshot.paramMap.get("hotelId");
    this.hotelId = id ? Number(id) : 0;
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


}
