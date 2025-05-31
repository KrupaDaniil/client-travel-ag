import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {HotelCardComponent} from '../hotel-card/hotel-card.component';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {ActivatedRoute} from '@angular/router';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {EntityStorage} from '../../../storage/entity.storage';
import {ICountryEntity} from '../../../interfaces/country-block/i-country.entity';
import {CountryService} from '../../../services/country.service';

@Component({
  selector: 'app-hotels-list-by-city',
  imports: [
    NgForOf,
    NgClass,
    HotelCardComponent,
    NgIf
  ],
  templateUrl: './hotels-list-by-city.component.html',
  styleUrl: './hotels-list-by-city.component.css'
})
export class HotelsListByCityComponent implements OnInit {
  private store = inject(EntityStorage)

  readonly hotels:Signal<IHotelEntity[]> = computed(()=>this.store.hotelsEntities());
  readonly countries:Signal<ICountryEntity[]> = computed(()=>this.store.countriesEntities());

  countryId:number;
   get country(){
     return this.countries().length > 0 ? this.countries()[0] : null;
   }


  constructor(private service: HotelService,private countryService:CountryService,private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get("countryId");
    this.countryId = id ? Number(id) : 0;
  }



  currentIndex = 0;
  get visibleHotels() {
    if(this.hotels().length > 0) {
      const visible = [];
      for (let i = 0; i < 3; i++) {
        visible.push(this.hotels()[(this.currentIndex + i) % this.hotels().length]);
      }
      return visible;
    }
    else{
      return null;
    }
  }

  nextSlide() {
    if(this.hotels())
      this.currentIndex = (this.currentIndex + 1) % this.hotels().length;
  }

  prevSlide() {
    if(this.hotels())
      this.currentIndex = (this.currentIndex - 1 + this.hotels().length) % this.hotels().length;

  }

  ngOnInit(): void {
    this.service.getHotelsByCountryId(this.countryId);
    this.countryService.setCountryById(this.countryId);


  }
}
