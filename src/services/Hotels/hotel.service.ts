import {inject, Injectable} from '@angular/core';
import {HttpService} from '../http.service';
import {IHotelEntity} from '../../interfaces/hotels-block/i-hotel.entity';
import {EntityStorage} from '../../storage/entity.storage';

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  constructor(private http: HttpService) {
  }

  private store = inject(EntityStorage);

  public getHotelsByCountryId(countryId: number): void {
    this.http.loadingHotelsByCountryId(countryId).subscribe(res => {
      this.store.setAllHotels(res as IHotelEntity[]);
    });
  }

  public getRandomHotelsByCountryId(countryId:number, amount:number):void {
    this.http.loadingRandomHotelsByCountryId(countryId,amount).subscribe(res=>{
      this.store.setAllHotels(res as IHotelEntity[]);

    });
  }

  public getTopHotelsByCountryId(countryId:number, amount:number):void {
    this.http.loadingTopHotelsByCountryId(countryId, amount).subscribe(res=>{
      this.store.setTopHotels(res as IHotelEntity[]);
    })
  }

  public getHotelById(hotelId: number) {
    let tmp = this.store.hotelsEntities().find((hotel)=>hotel.id === hotelId);
    if(tmp!=undefined){
      console.log("Hotel found in storage");
      return tmp;
    }
    return this.http.loadingHotelById(hotelId);

  }
}
