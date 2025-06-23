import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Signal,
  ViewChild
} from '@angular/core';
import {StarsRateComponent} from '../stars-rate/stars-rate.component';
import {KeyValuePipe, NgIf, NgOptimizedImage} from '@angular/common';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {RatingType} from '../../../models/enums/rating';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {IHotelFeedbackEntity} from '../../../interfaces/hotels-block/i-hotel-feedback.entity';
import {IHotelRatesEntity} from '../../../interfaces/hotels-block/i-hotel-rates.entity';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';


@Component({
  selector: 'app-hotel-about',
  imports: [
    StarsRateComponent,
    NgIf,
    KeyValuePipe,
    NgOptimizedImage,
    ReactiveFormsModule
  ],
  templateUrl: './hotel-about.component.html',
  styleUrl: './hotel-about.component.css'
})
export class HotelAboutComponent implements OnInit {
  @Input() hotel?: IHotelDetailsEntity;
  @Output() addingFeedback: EventEmitter<IHotelFeedbackEntity> = new EventEmitter();

  public createFeedback: FormGroup = new FormGroup({
    text: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    locationRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)]),
    roomsRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)]),
    cleanRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)]),
    serviceRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)]),
    sleepRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)]),
    priceRating: new FormControl('', [Validators.required, Validators.max(5), Validators.min(0)])
  })


  get avgRates(){
    if(this.rate){
      return new Map([
        ['Локація', this.rate.locationRating],
        ['Кімнати', this.rate.roomsRating],
        ['Ціна', this.rate.priceRating],
        ['Чистота', this.rate.cleanRating],
        ['Обслуговуванная', this.rate.serviceRating],
        ['Якість сну', this.rate.sleepRating],
      ])
    }
    return undefined;

  }
  // public avgRates: Map<string, number> = new Map([
  //   ['Локація', 0],
  //   ['Кімнати', 0],
  //   ['Ціна', 0],
  //   ['Чистота', 0],
  //   ['Обслуговуванная', 0],
  //   ['Якість сну', 0],
  // ]);


  private store = inject(EntityStoragePr2);
  readonly rates:Signal<IHotelRatesEntity[]> = computed(()=>this.store.hotelRatesEntities())
  // public rate:WritableSignal<IHotelRatesEntity|null> = signal<IHotelRatesEntity|null>(null);


  get rate(){
    return this.rates().find(x => x.hotelId == this.hotel!.id);
  }

  @ViewChild("closeModalButton") closeModalButton?: ElementRef

  isLoadingFeedback = false;

  constructor(private service: HotelService) {

  }


  ngOnInit(): void {
    this.initRates();
  }

  // private setAvgmarks() {
  //   if (this.rate) {
  //     this.avgRates.set('Локація', this.rate.locationRating);
  //     this.avgRates.set('Кімнати', this.rate.roomsRating);
  //     this.avgRates.set('Ціна', this.rate.priceRating);
  //     this.avgRates.set('Чистота', this.rate.cleanRating);
  //     this.avgRates.set('Обслуговуванная', this.rate.serviceRating);
  //     this.avgRates.set('Якість сну', this.rate.sleepRating);
  //   }
  // }



  private initRates(){
    if (this.hotel){
      let rate = this.rates().find(x=>x.hotelId==this.hotel!.id);
      if(this.rates().length === 0 || !rate){
        this.service.getRateByHotelI(this.hotel.id);
        rate = this.rates().find(x=>x.hotelId==this.hotel!.id);
        if(rate){
          // this.rate.set(rate);
        }

      }
      else{
        // this.rate.set(rate);
      }
      // this.setAvgmarks();
    }
    else{
      return;
    }

  }

  get ratingKeys(): string[] {
    return Object.keys(RatingType).filter(k => isNaN(Number(k)));
  }


  addFeedback() {
    if (this.createFeedback.valid) {
      if (this.closeModalButton && this.hotel) {

        let result = this.createFeedback.value;
        result.hotelId = this.hotel.id;
        result.date = new Date();
        this.isLoadingFeedback = true;
        this.service.createFeedback(result).subscribe(res => {
          if (this.closeModalButton) {
            this.isLoadingFeedback = false;
            this.closeModalButton.nativeElement.click();
            this.addingFeedback.emit(res as IHotelFeedbackEntity);
          }
        });
      }

    } else {
      this.createFeedback.markAllAsTouched();
    }

  }
}
