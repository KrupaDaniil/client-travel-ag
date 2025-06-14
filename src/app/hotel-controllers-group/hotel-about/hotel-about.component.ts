import {Component, computed, ElementRef, inject, Input, OnInit, Signal, ViewChild} from '@angular/core';
import {StarsComponent} from '../stars/stars.component';
import {StarsRateComponent} from '../stars-rate/stars-rate.component';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {KeyValuePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {IHotelFeedbackEntity} from '../../../interfaces/hotels-block/i-hotel-feedback.entity';
import {RatingType} from '../../../models/enums/rating';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';
import {EntityStorage} from '../../../storage/entity.storage';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';


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

  public createFeedback:FormGroup = new FormGroup({
    text: new FormControl('', [Validators.required]),
    locationRating: new FormControl('', [Validators.required,Validators.max(5), Validators.min(0)]),
    roomsRating: new FormControl('', [Validators.required,Validators.max(5), Validators.min(0)]),
    cleanRating: new FormControl('',[Validators.required,Validators.max(5), Validators.min(0)]),
    serviceRating: new FormControl('', [Validators.required,Validators.max(5), Validators.min(0)]),
    sleepRating: new FormControl('', [Validators.required,Validators.max(5), Validators.min(0)]),
    priceRating: new FormControl('', [Validators.required,Validators.max(5), Validators.min(0)])
  })

  public avgRates:Map<string,number> = new Map([
    ['Локація',0],
    ['Кімнати',0],
    ['Ціна',0],
    ['Чистота',0],
    ['Обслуговуванная',0],
    ['Якість сну',0],
  ]);

  public ratesAmount:number[] = new Array(5).fill(0);

  private store = inject(EntityStorage);

  @ViewChild("closeModalButton") closeModalButton?: ElementRef

  isLoadingFeedback = false;

  constructor(private service:HotelService) {

  }

  private setAvgmarks(){
    if(this.hotel && this.hotel.feedbacks.length > 0){
      console.log(this.hotel.feedbacks.reduce((sum, item)=>sum+item.locationRating,0)/this.hotel.feedbacks.length);
      this.avgRates.set('Локація',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.locationRating,0)/this.hotel.feedbacks.length*10)/10);
      this.avgRates.set('Кімнати',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.roomsRating,0)/this.hotel.feedbacks.length*10)/10);
      this.avgRates.set('Ціна',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.priceRating,0)/this.hotel.feedbacks.length*10)/10);
      this.avgRates.set('Чистота',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.cleanRating,0)/this.hotel.feedbacks.length*10)/10);
      this.avgRates.set('Обслуговуванная',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.serviceRating,0)/this.hotel.feedbacks.length*10)/10);
      this.avgRates.set('Якість сну',Math.floor(this.hotel.feedbacks.reduce((sum, item)=>sum+item.sleepRating,0)/this.hotel.feedbacks.length*10)/10);
    }
  }

  private setFeedbacksAmount(){
    if(this.hotel && this.hotel.feedbacks.length > 0 ){
      this.hotel.feedbacks.flatMap(x=>x.totalRating).forEach(mark => {
        let index = mark < 1 ? 0 : Math.min(Math.floor(mark), 5) - 1;
        this.ratesAmount[index]++;
      });
      this.ratesAmount = this.ratesAmount.reverse();
      console.log(this.ratesAmount);
    }
  }

  ngOnInit(): void {
    this.setAvgmarks();
    this.setFeedbacksAmount();
  }


  get ratingKeys(): string[] {
    return Object.keys(RatingType).filter(k => isNaN(Number(k)));
  }


  addFeedback() {
    if(this.createFeedback.valid){
      if(this.closeModalButton &&this.hotel){

        let result = this.createFeedback.value;
        result.hotelId = this.hotel.id;
        result.date=new Date();
        this.isLoadingFeedback = true;
        this.service.createFeedback(this.createFeedback.value).subscribe(res=>
        {
          if(this.closeModalButton){
            this.isLoadingFeedback = false;
            this.closeModalButton.nativeElement.click();
          }
        });
      }

    }
    else{
      this.createFeedback.markAllAsTouched();
    }

  }
}
