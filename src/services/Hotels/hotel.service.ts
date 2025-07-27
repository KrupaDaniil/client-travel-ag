import { inject, Injectable } from "@angular/core";
import { HttpService } from "../http.service";
import { IHotelEntity } from "../../interfaces/hotels-block/i-hotel.entity";
import { EntityStorage } from "../../storage/entity.storage";
import { EntityStoragePr2 } from "../../storage/entity.storage.pr2";
import { MessageService } from "../message.service";
import { IAdminHotelEntity } from "../../interfaces/hotels-block/i-admin-hotel.entity";
import { IError } from "../../interfaces/i-error";
import { ValidationService } from "../validation.service";
import { catchError, firstValueFrom, map, Observable, of } from "rxjs";
import { IHotelFeedbackEntity } from '../../interfaces/hotels-block/i-hotel-feedback.entity';
import { IHotelDetailsEntity } from '../../interfaces/hotels-block/i-hotel-details.entity';
import { IHotelRatesEntity } from '../../interfaces/hotels-block/i-hotel-rates.entity';

@Injectable({
  providedIn: "root"
})
export class HotelService {
  private readonly store = inject(EntityStorage);
  private readonly storePr2 = inject(EntityStoragePr2);

  constructor(private http: HttpService, private message: MessageService, private check: ValidationService) {
  }

  public getHotelsByCountryId(countryId: number): void {
    this.http.loadingHotelsByCountryId(countryId).subscribe(res => {
      this.store.setAllHotels(res as IHotelEntity[]);
    });
  }

  public getRandomHotelsByCountryId(countryId: number, amount: number): void {
    this.http.loadingRandomHotelsByCountryId(countryId, amount).subscribe(res => {
      this.store.setAllHotels(res as IHotelEntity[]);
    });
  }

  public getTopHotelsByCountryId(cityId: number, amount: number): void {
    this.http.loadingTopHotelsByCityId(cityId, amount).subscribe(res => {
      this.store.setTopHotels(res as IHotelEntity[]);
    });
  }

  public getFeedbacksByHotelId(hotelId: number) {
    return this.http.loadingAllFeedbacksByHotelId(hotelId);
  }

  public getRateByHotelI(hotelId: number) {
    this.http.loadingRateByHotelId(hotelId).subscribe((res: IHotelRatesEntity | IError) => {
      if (this.check.isError(res)) {
        this.message.setMessage((res as IError).message);
      } else {
        this.message.setMessage(null);
        this.storePr2.setHotelRate(res as IHotelRatesEntity);
      }
    })
  }

  getAllHotelToAdmin(): Observable<boolean> {
    return this.http.loadingAllHotelToAdmin().pipe(
      map((item: IAdminHotelEntity[] | IError): boolean => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
          return false;
        } else {
          this.message.setMessage(null);
          this.storePr2.setAllAdminHotels(item as IAdminHotelEntity[]);
          return true;
        }
      })
    );
  }

  getAllHotelToAdminByIds(ids: number[]): Observable<boolean> {
    return this.http.loadingAllHotelToAdminByIds(ids).pipe(
      map((item: IAdminHotelEntity[] | IError): boolean => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
          return false;
        } else {
          this.message.setMessage(null);
          this.storePr2.setAllAdminHotels(item as IAdminHotelEntity[]);
          return true;
        }
      })
    );
  }


  createFeedback(feedback: IHotelFeedbackEntity): Observable<IHotelFeedbackEntity | IError> {
    return this.http.addFeedback(feedback);
  }

  async createHotel(hotel: FormData): Promise<number | undefined> {
    return await firstValueFrom(
      this.http.addHotel(hotel).pipe(
        map((item: number | IError): number | undefined => {
          if (this.check.isError(item)) {
            this.message.setMessage((item as IError).message);
            return undefined;
          } else {
            this.message.setMessage(null);
            return item as number;
          }
        })
      )
    );
  }

  async updateHotel(hotel: FormData): Promise<boolean> {
    return await firstValueFrom(
      this.http.updateHotel(hotel).pipe(
        map((item: boolean | IError): boolean => {
          if (this.check.isError(item)) {
            this.message.setMessage((item as IError).message);
            return false;
          } else {
            this.message.setMessage(null);
            return item as boolean;
          }
        })
      )
    );
  }

  async getAdminHotelById(hotelId: number): Promise<IAdminHotelEntity | null> {
    return await firstValueFrom(
      this.http.loadingHotelByIdToAdmin(hotelId).pipe(
        map((item: IAdminHotelEntity | IError): IAdminHotelEntity | null => {
          if (this.check.isError(item)) {
            this.message.setMessage((item as IError).message);
            return null;
          } else {
            this.message.setMessage(null);
            return item as IAdminHotelEntity;
          }
        })
      )
    );
  }

  setIHotelEntityToStore(hotelId: number): void {
    this.http.loadingHotelById(hotelId).subscribe({
      next: (item: IHotelEntity | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setHotel(item as IHotelEntity);
        }
      }
    });
  }

  removeHotel(id: number): Observable<boolean> {
    return this.http.deleteHotel(id).pipe(
      map((item: boolean | IError): boolean => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
          return false;
        } else {
          if (item) {
            this.message.setMessage("Hotel deleted successfully");
            this.storePr2.removeAdminHotel(id);
            this.store.removeHotel(id);
            return true;
          }
          return false;
        }
      })
    );
  }

  public getHotelById(hotelId: number, feedbacksToLoad: number = 2): Observable<IHotelDetailsEntity | undefined> {
    let tmp: IHotelDetailsEntity | undefined = this.storePr2
      .hotelDetailsEntities()
      .find((hotel: IHotelDetailsEntity): boolean => hotel.id === hotelId);

    if (tmp != undefined) {
      console.log("Hotel found in storage");
      return of(tmp);
    }

    return this.http.loadingHotelById(hotelId, feedbacksToLoad).pipe(
      map((item: IHotelEntity | IError): IHotelDetailsEntity | undefined => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
          return undefined;
        } else {
          this.message.setMessage(null);
          this.storePr2.setHotelDetails(item as IHotelDetailsEntity);
          return item as IHotelDetailsEntity;
        }
      })
    );
  }


  getFoodTypesByHotelId(hotelId: number) {
    return this.http.loadingFoodTypesByHotelId(hotelId);
  }

  getRoomTypesByHotelId(hotelId: number) {
    return this.http.loadingRoomTypesByHotelId(hotelId);
  }

  bookHotel(hotelData: FormData) {
    return this.http.addBookingHotelAdv(hotelData).pipe(
      map(res => {
        return res;
      }),
      catchError((error: IError) => {
        return of(error as IError);
      })
    );
  }

  loadingHotelsByParameters(countries: number[], minRate: number, maxRate: number, name: string) {
    return this.http.loadingHotelsByParameters(countries, minRate, maxRate, name).pipe(
      map(res => {
        if (!this.check.isHttpError(res as IError)) {
          return res as IHotelEntity[];
        } else {
          return null;
        }

      }),
      catchError((error: IError) => {
        return of(null);
      })
    );
  }

  searchHotelsByFilter(name: string, price: number, numberOfPeople: number, cityIds: number[]) {
    return this.http.searchHotelsByFilter(name, price, numberOfPeople, cityIds).pipe(
      map(res => {
        if (!this.check.isHttpError(res as IError)) {
          return res as Number[];
        } else {
          return null;
        }
      }),
      catchError((error: IError) => {
        return of(null);
      })
    );
  }
}
