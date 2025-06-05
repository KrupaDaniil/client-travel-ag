import {Component, inject, Input, OnInit} from '@angular/core';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {NgIf} from '@angular/common';
import {StarsComponent} from '../stars/stars.component';
import {EntityStorage} from '../../../storage/entity.storage';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {CountryService} from '../../../services/country.service';
import {ActivatedRoute} from '@angular/router';
import {isObservable} from 'rxjs';
import {ValidationService} from '../../../services/validation.service';

@Component({
  selector: 'app-hotel-details',
  imports: [
    NgIf,
    StarsComponent
  ],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.css'
})
export class HotelDetailsComponent implements OnInit {

  private readonly hotelId:number;
  private store  = inject(EntityStorage)
  public hotel?: IHotelEntity;

  constructor(private service: HotelService, private countryService: CountryService, private route: ActivatedRoute,private check: ValidationService) {
    const id = this.route.snapshot.paramMap.get("hotelId");
    this.hotelId = id ? Number(id) : 0;
  }

  ngOnInit(): void {
    let res = this.service.getHotelById(this.hotelId);
    console.log(res);
    if (!isObservable(res)) {
      this.hotel = res;
    }
    else{
      res.subscribe(res=>{
        if(!this.check.isError(res)){
          this.store.setHotel(res as IHotelEntity);
          this.hotel = res as IHotelEntity;
        }
      })
    }
  }





}
