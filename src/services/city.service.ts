import {inject, Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {MessageService} from "./message.service";
import {ValidationService} from "./validation.service";
import {EntityStorage} from "../storage/entity.storage";
import {firstValueFrom, map} from "rxjs";
import {ICityEntity} from "../interfaces/country-block/i-city.entity";
import {IMainCountryForCityEntity} from "../interfaces/country-block/i-main-country-for-city.entity";
import {IBlobImageEntity} from "../interfaces/country-block/i-blob-image.entity";
import {IError} from "../interfaces/i-error";
import {IMinCityEntity} from '../interfaces/country-block/i-min-city.entity';
import {IMinCityCountryEntity} from '../interfaces/country-block/i-min-city-country.entity';
import {EntityStoragePr2} from '../storage/entity.storage.pr2';
import {HttpResponse, HttpStatusCode} from '@angular/common/http';
import {ErrorMessage} from '../models/error-message';

@Injectable({
  providedIn: "root"
})
export class CityService {
  private readonly store = inject(EntityStorage);
  private readonly storepr2 = inject(EntityStoragePr2);

  constructor(private http_s: HttpService, private messages: MessageService, private check: ValidationService) {
  }

  setAllAdminCities(): void {
    this.http_s.loadingAllAdminCities().subscribe({
      next: (cities: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError): void => {
        if (this.check.isError(cities)) {
          this.messages.setMessage((cities as IError).message);
        } else {
          this.messages.setMessage(null);
          this.store.setAllAdminCities(cities as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]);
        }
      }
    });
  }

  setAllMinCityCountry(){
    return this.http_s.loadingAllMinCityCountries().pipe(
      map((items: IMinCityCountryEntity[] | IError): IMinCityCountryEntity[] | IError => {
        if (this.check.isError(items)) {
          this.messages.setMessage((items as IError).message);
          return new ErrorMessage(HttpStatusCode.NoContent, "Can'r load cities");
        }
        else{
          this.messages.setMessage(null);
          this.storepr2.setAllMinCityCountries(items as IMinCityCountryEntity[]);
          return items as IMinCityCountryEntity[];
        }
      })
    );

    // if (this.check.isError(cities)) {
    //   this.messages.setMessage((cities as IError).message);
    // }
    // else{
    //   this.messages.setMessage(null);
    //   this.storepr2.setAllMinCityCountries(cities as IMinCityCountryEntity[]);
    // }
  }

  async getAllCountryCities(id: number): Promise<IMinCityEntity[] | undefined> {
    return await firstValueFrom(
      this.http_s.loadingAllCountryMinCities(id).pipe(
        map((item: IMinCityEntity[] | IError): IMinCityEntity[] | undefined => {
          if (this.check.isError(item)) {
            this.messages.setMessage((item as IError).message);
            return undefined;
          } else {
            this.messages.setMessage(null);
            return item as IMinCityEntity[];
          }
        })
      )
    );
  }

  async addCityEntity(newCity: FormData): Promise<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null> {
    return await firstValueFrom(
      this.http_s
        .addCity(newCity)
        .pipe(
          map((
              entity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError
            ): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null =>
              this.setCity(entity)
          )
        )
    );
  }

  async updateCityEntity(updateCity: FormData): Promise<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null> {
    return await firstValueFrom(
      this.http_s
        .updateCity(updateCity)
        .pipe(
          map((
              entity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError
            ): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null =>
              this.setCity(entity)
          )
        )
    );
  }

  async deleteCityEntity(id: number): Promise<boolean> {
    return await firstValueFrom(
      this.http_s.deleteCity(id).pipe(
        map((entity: boolean | IError): boolean => {
          if (this.check.isError(entity)) {
            this.messages.setMessage((entity as IError).message);
            return false;
          } else {
            this.messages.setMessage(null);
            this.store.removeCity(id);
            return true;
          }
        })
      )
    );
  }

  private setCity(
    city: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError
  ): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | null {
    if (this.check.isError(city)) {
      this.messages.setMessage((city as IError).message);
      return null;
    } else {
      this.messages.setMessage(null);
      this.store.setAdminCity(city as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>);
      return city as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>;
    }
  }


}
