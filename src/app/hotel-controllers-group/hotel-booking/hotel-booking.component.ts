import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {KeyValuePipe, NgOptimizedImage} from '@angular/common';
import {OwlDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {StatisticService} from '../../../services/statistic.service';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {ValidationService} from '../../../services/validation.service';
import {IError} from '../../../interfaces/i-error';
import {IAdminFoodType} from '../../../interfaces/hotels-block/i-admin-food-type';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';
import {IAdminRoomType} from '../../../interfaces/hotels-block/i-admin-room-type';
import {FromToService} from '../../../services/from-to.service';
import {ICityBookingEntity} from '../../../interfaces/country-block/i-city-booking.entity';
import {Toast} from 'bootstrap';
import {HotToastService} from '@ngxpert/hot-toast';

@Component({
  selector: 'app-hotel-booking',
  imports: [
    ReactiveFormsModule,
    NgOptimizedImage,
    OwlDateTimeModule,
    KeyValuePipe
  ],
  providers: [StatisticService],
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.css'
})
export class HotelBookingComponent implements OnInit {

  public bookForm: FormGroup = new FormGroup({
    checkin: new FormControl('', [Validators.required]),
    checkout: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    roomType: new FormControl('', [Validators.required, Validators.min(1)]),
    foodType: new FormControl('', [Validators.required, Validators.min(1)]),
    from: new FormControl(0, [Validators.required,Validators.min(1)]),
    clientName: new FormControl('', [Validators.required]),
    clientSurname: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),

  });


  protected readonly Array = Array;

  @Input() hotel?: IHotelDetailsEntity;

  @ViewChild("checkinInp") checkinInp?:ElementRef;
  @ViewChild("checkoutInp") checkoutInp?:ElementRef;
  @ViewChild("foodInp") foodInp?:ElementRef;
  @ViewChild("roomInp") roomInp?:ElementRef;



  public foodTypes: IAdminFoodType[] = [];
  public roomTypes: IAdminRoomType[] = [];
  public citiesFrom: ICityBookingEntity[] = [];

  constructor(private stService: StatisticService,
              private hotelService:HotelService,
              private check:ValidationService,
              private fromToService:FromToService,
              private toast:HotToastService) {


  }

  protected countApp(): void {
    if (this.hotel && this.hotel.id > 0) {
      this.stService.countHBUp(this.hotel.id);
    }
  }

  public bookHotel():void{
    if(this.bookForm.valid){
      if(this.hotel) {
        let data = this.bookForm.value;
        data.hotelId = this.hotel.id;

        this.hotelService.bookHotel(this.bookForm.value).subscribe(
          res => {
            if(this.check.isHttpError(res as IError)){
              this.showErrorMessage("Помилка при бронюванні готелю!");
            }
            else{
              console.log("OK", res);
            }


          }
        );
      }
    }

  }

  private initFoodTypes(){
    if(this.hotel){
      this.hotelService.getFoodTypesByHotelId(this.hotel.id).subscribe(res=>{
        if(!this.check.isError(res as IError)){
          this.foodTypes = res as IAdminFoodType[];
          console.log(res);
        }
      });
    }
    else{
      console.log("No hotel id");
    }
  }

  private initRoomTypes(){
    if(this.hotel){
      this.hotelService.getRoomTypesByHotelId(this.hotel.id).subscribe(res=>{
        if(!this.check.isError(res as IError)){
          this.roomTypes = res as IAdminRoomType[];
          console.log(res)
        }
      });
    }
    else{
      console.log("No hotel id");
    }
  }

  private initCitiesFrom(){
    if(this.hotel){
      this.fromToService.getFromCountries(this.hotel.cityId).subscribe(res=>{
        if(!this.check.isError(res as IError)){
          this.citiesFrom = res as ICityBookingEntity[];
          console.log(res)
        }
      });
    }
  }


  ngOnInit(): void {
    this.initFoodTypes();
    this.initRoomTypes();
    this.initCitiesFrom();

    // this.bookForm.get("checkin")!.valueChanges.subscribe(val=>{
    //   this.countSum();
    // })
    //
    // this.bookForm.get("checkout")!.valueChanges.subscribe(val=>{
    //   this.countSum();
    // })
  }

  get getCategorizedCities(){
    let countryMap = new Map();
    this.citiesFrom.forEach(({ countryName, cityName, cityId }) => {
      const city = { cityName, cityId };
      if (!countryMap.has(countryName)) {
        countryMap.set(countryName, [city]);
      } else {
        countryMap.get(countryName).push(city);
      }
    });
    return countryMap;
  }

  private showErrorMessage(message:string): void {
    this.toast.show(`${message}`, {
      theme: "snackbar",
      duration: 5000,
      autoClose: true,
      position: "bottom-left"
    })

  }

  get countSum(){
    let food = this.foodInp?.nativeElement.value;
    let room = this.roomInp?.nativeElement.value;
    let from = this.checkinInp?.nativeElement.value;
    let to = this.checkoutInp?.nativeElement.value;
    let sum = 0;
    if(food)
      sum+=this.foodTypes.find(x=>x.id==food) ? this.foodTypes.find(x=>x.id==food)!.price : 0;
    if(room)
      sum+=this.roomTypes.find(x=>x.id==room) ? this.roomTypes.find(x=>x.id==room)!.price : 0;

    if(from&&to){
      return sum * (
        (this.parseDate(to).getTime()-this.parseDate(from).getTime())
        /(1000 * 60 * 60 * 24)


      )
    }

    return "-";


  }

  parseDate(str:any) {
    const [day, month, year] = str.split('.');
    // Month in JS Date is zero-based, so subtract 1
    return new Date(year, month - 1, day);
  }
}
