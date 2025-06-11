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

@Injectable({
  providedIn: "root"
})
export class CityService {
  private readonly store = inject(EntityStorage);

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

  async addCityEntity(newCity: FormData): Promise<boolean> {
    return await firstValueFrom(
      this.http_s
        .addCity(newCity)
        .pipe(
          map((entity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError): boolean =>
            this.setCity(entity)
          )
        )
    );
  }

  async updateCityEntity(updateCity: FormData): Promise<boolean> {
    return await firstValueFrom(
      this.http_s
        .updateCity(updateCity)
        .pipe(
          map((entity: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError): boolean =>
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

  private setCity(city: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError): boolean {
    if (this.check.isError(city)) {
      this.messages.setMessage((city as IError).message);
      return false;
    } else {
      this.messages.setMessage(null);
      this.store.setAdminCity(city as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>);
      return true;
    }
  }
}
