import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {HotelCardComponent} from '../hotel-card/hotel-card.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {EntityStorage} from '../../../storage/entity.storage';
import {ICountryEntity} from '../../../interfaces/country-block/i-country.entity';
import {CountryService} from '../../../services/country.service';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {LoadingComponent} from '../../loading/loading.component';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpParams} from '@angular/common/http';
import {IMinCityEntity} from '../../../interfaces/country-block/i-min-city.entity';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {IMinCityCountryEntity} from '../../../interfaces/country-block/i-min-city-country.entity';
import {CityService} from '../../../services/city.service';
import {ValidationService} from '../../../services/validation.service';
import {ICityEntity} from '../../../interfaces/country-block/i-city.entity';
import {IMainCountryForCityEntity} from '../../../interfaces/country-block/i-main-country-for-city.entity';
import {IBlobImageEntity} from '../../../interfaces/country-block/i-blob-image.entity';

@Component({
  selector: 'app-Hotels-list-by-city',
  imports: [
    NgForOf,
    NgClass,
    HotelCardComponent,
    NgIf,
    LoadingComponent,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './hotels-list-by-city.component.html',
  styleUrl: './hotels-list-by-city.component.css'
})
export class HotelsListByCityComponent implements OnInit {
  private store = inject(EntityStorage)
  private store2 = inject(EntityStoragePr2)
  public cancelError = true;
  // readonly hotels: Signal<IHotelEntity[]> = computed(() => this.store.hotelsEntities());
  // readonly topHotels: Signal<IHotelEntity[]> = computed(() => this.store.topHotelsEntities());

  // countryId: number;
  // readonly countries: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());

  cityId: number;
  readonly cities:Signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]> = computed(() => this.store.admin_citiesEntities());
  readonly hotels:Signal<IHotelEntity[]> = computed(()=>this.store.topHotelsEntities());


  // get country(): ICountryEntity | undefined {
  //   return this.countries().length > 0 ? this.countries()[0] : undefined;
  // }

  get city():ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>| undefined {
    let res = this.cities().find(x=>x.id==this.cityId);
    return res ? res : undefined;
  }

  public searchHotelGroup:FormGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  })

  constructor(private service: HotelService,
              private countryService:
              CountryService,
              private route: ActivatedRoute,
              private router: Router,
              private cityService:CityService,
              private check:ValidationService,) {
    // const id = this.route.snapshot.paramMap.get("countryId");
    // this.countryId = id ? Number(id) : 0;

    const cityId = this.route.snapshot.paramMap.get("cityId");
    this.cityId = cityId ? Number(cityId) : 0;
  }

  ngOnInit(): void {
    this.service.getTopHotelsByCountryId(this.cityId, 10);
    this.cityService.setAllAdminCities();
  }



  get otherHotels(){
    let startIndex = 3;
    return this.hotels().slice(startIndex,this.hotels().length-1);
  }

  currentIndex = 0;

  get visibleHotels() {

    let tmp = this.hotels().slice(0,3);
    if (this.hotels().length > 0) {
      const visible = [];
      for (let i = 0; i < 3; i++) {
        visible.push(tmp[(this.currentIndex + i) % tmp.length]);
      }
      return visible;
    } else {
      return null;
    }
  }

  nextSlide() {
    if (this.hotels())
      this.currentIndex = (this.currentIndex + 1) % this.hotels().length;
  }

  prevSlide() {
    if (this.hotels())
      this.currentIndex = (this.currentIndex - 1 + this.hotels().length) % this.hotels().length;

  }

  searchHotel() {
    let name= this.searchHotelGroup.get("name")?.value;
    if(name)
      this.router.navigate(['/hotels'],{queryParams: {name: name,cityIds:this.cityId}});
  }
}
