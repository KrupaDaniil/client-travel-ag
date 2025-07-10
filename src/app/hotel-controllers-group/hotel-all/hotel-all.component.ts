import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {EntityStorage} from '../../../storage/entity.storage';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs';
import {HotToastService} from '@ngxpert/hot-toast';
import {IAdminHotelEntity} from '../../../interfaces/hotels-block/i-admin-hotel.entity';
import {HotelCardComponent} from '../hotel-card/hotel-card.component';
import {IHotelImage} from '../../../interfaces/hotels-block/IHotelImage.entity';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {LoadingComponent} from '../../loading/loading.component';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {ICityEntity} from '../../../interfaces/country-block/i-city.entity';
import {IMinCityEntity} from '../../../interfaces/country-block/i-min-city.entity';
import {IMinCityCountryEntity} from '../../../interfaces/country-block/i-min-city-country.entity';
import {CityService} from '../../../services/city.service';

@Component({
  selector: 'app-hotel-all',
  imports: [
    HotelCardComponent,
    NgClass,
    LoadingComponent,
    ReactiveFormsModule,
    NgSelectComponent
  ],
  templateUrl: './hotel-all.component.html',
  styleUrl: './hotel-all.component.css'
})
export class HotelAllComponent {
  public citiesIds:Number = 0;
  constructor(private service: HotelService, private route: ActivatedRoute, private toast:HotToastService, private citiesSerive:CityService, private router:Router) {
    this.countryIdRequest = this.route.snapshot.queryParams['countryId'];
    console.log(this.citiesIds);
    this.citiesIds =  Number(this.route.snapshot.queryParams['cityIds']);

    this.initHotels();
    this.initCities();

    this.applyFilters();
  }


  public cancelError = false;

  readonly store = inject(EntityStoragePr2);

  readonly hotels:Signal<IAdminHotelEntity[]> = computed(() => this.store.adminHotelsEntities());
  readonly cities:Signal<IMinCityCountryEntity[]> = computed(()=>this.store.minCityCountryEntities());



  public filteredHotels:WritableSignal<IAdminHotelEntity[] | null> = signal<IAdminHotelEntity[] | null>(null);


  @ViewChild("top") top!:ElementRef;

  public filter:FormGroup = new FormGroup({
    name:new FormControl(""),
    minRate: new FormControl(0,[Validators.min(0),Validators.max(5)]),
    maxRate: new FormControl(0,[Validators.min(0),Validators.max(5)]),
    cityIds: new FormControl([]),

  })
  public countryIdRequest:number|undefined;

  protected itemsPerPage = 10;
  protected currentPage: number = 0;
  get maxPages(){
    if(this.filteredHotels()!==null){
      return Math.ceil(this.filteredHotels()!.length / this.itemsPerPage);
    }
    return 0;
  }



  private initHotels(){
    this.service.getAllHotelToAdmin().subscribe(res=>{
      if(!res){
        this.toast.show("No hotels found",{
          theme: "snackbar",
          duration: 5000,
          autoClose: true,
          position: "bottom-left"
        });
        this.cancelError = false;
      }
      else{
        this.filteredHotels.set(this.hotels());
        this.loadFilters();
        this.cancelError = true;
      }
    });
  }

  private initCities(){
    if(this.cities().length === 0){
      this.citiesSerive.setAllMinCityCountry().subscribe(res=>{
        if(res){
          if(this.citiesIds) {
            this.filter.patchValue({cityIds: Array.of(this.citiesIds)});
            console.log(this.filter.value);
          }
        }
      });
    }
  }

  private applyFilters() {
    let name = this.route.snapshot.queryParams['name'];
    if(name){
      this.filter.patchValue({name:name});
    }

  }

  get hotelsOnPage():IHotelEntity[] | undefined{
    return this.filteredHotels()
      ?.slice(this.currentPage * this.itemsPerPage, this.currentPage * this.itemsPerPage+this.itemsPerPage)
      .map(res=>this.toIHotelEntity(res));
  }



  protected loadFilters(){
    let name = this.filter.get('name')?.value;
    let minValue = this.filter.get('minRate')?.value;
    let maxValue = this.filter.get('maxRate')?.value;
    let cityIds = this.filter.get('cityIds')?.value;

    console.log(cityIds)
    let result:IAdminHotelEntity[]=this.hotels()!;

    if(name!=="")
      result = result.filter((h: IAdminHotelEntity) =>
        h.hotelName.toLowerCase().includes(name.toLowerCase())
      )
    if(minValue|| maxValue){
      result = result.filter((h: IAdminHotelEntity) =>{
          return h.rate >=minValue && h.rate <= maxValue;
        }
      );
    }

    if(cityIds.length>0){
      result = result.filter((h: IAdminHotelEntity) =>
        cityIds.includes(h.city.id));
    }



    this.filteredHotels.set(result);
  }

  private filterByName(name:string):IAdminHotelEntity[]{
    return this.hotels().filter((h: IAdminHotelEntity) =>
      h.hotelName.toLowerCase().includes(name.toLowerCase())
    )
  }

  private filterByFeedbackRange(minValue: number, maxValue: number):IAdminHotelEntity[]{

    return this.hotels().filter((h: IAdminHotelEntity) =>{
      return h.rate >=minValue && h.rate <= maxValue;
    }

    );
  }

  private filterByCities(cities:number[]){
    return this.hotels().filter((h: IAdminHotelEntity) =>
      cities.includes(h.city.id)
    )
  }

  private toIHotelEntity(old:IAdminHotelEntity){
    let res:IHotelEntity = new class implements IHotelEntity {
      countryName: String = "";
      hotelsInCountry: number = 0;
      address: string = old.address;
      cityId: number = old.city.id;
      cityName: string = old.city.name;
      description: string = old.description;
      feedbacksAmount: number = old.feedbacksAmount;
      hotelName: string = old.hotelName;
      id: number = old.id;
      images: IHotelImage[] = old.images;
      place: number = 0;
      rate: number = old.rate;
    };
    return res;

  }

  protected readonly Array = Array;

  goToPage($index: number) {
    if($index>=0 && $index <= this.maxPages){
      this.currentPage = $index;
      this.top?.nativeElement.scrollIntoView({behavior: 'smooth'});
    }

  }

  clearData() {
    this.filter.reset();
    this.router.navigate(['/hotels']);
  }


}
