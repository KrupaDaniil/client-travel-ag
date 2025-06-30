import {inject, Injectable} from '@angular/core';
import {EntityStorage} from '../storage/entity.storage';
import {HttpService} from './http.service';
import {MessageService} from './message.service';
import {ValidationService} from './validation.service';
import {ICountryEntity} from '../interfaces/country-block/i-country.entity';
import {firstValueFrom, map, Observable, of} from 'rxjs';
import {IError} from '../interfaces/i-error';
import {IMinCountryEntity} from '../interfaces/country-block/i-min-country.entity';
import {EntityStoragePr2} from '../storage/entity.storage.pr2';
import {HttpResponse, HttpStatusCode} from '@angular/common/http';
import {ErrorMessage} from '../models/error-message';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly store = inject(EntityStorage);
  private readonly storePr2 = inject(EntityStoragePr2);

  constructor(
    private http_s: HttpService,
    private message: MessageService,
    private check: ValidationService
  ) {
  }

  setAllCountry(): void {
    this.http_s.loadingAllCountryByAdmin().subscribe({
      next: (item: ICountryEntity[] | IError) => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setAllCountries(item as ICountryEntity[]);
        }
      },
    });
  }

  setAllMinCountry(): void {
    this.http_s.loadingAllMinCountry().subscribe({
      next: (item: IMinCountryEntity[] | IError) => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.storePr2.setAllMinCountries(item as IMinCountryEntity[]);
        }
      }
    });
  }

  setCountryById(id: number):Observable<boolean> {
    return this.http_s.loadingCountryById(id).pipe(
      map((response): boolean => {
        if (this.check.isError(response)) {
          this.message.setMessage((response as IError).message);
          return false;
        } else {
          this.message.setMessage(null);
          this.store.setCountry(response as ICountryEntity);
          return true;
        }
    })
    );
  }

//
//   next: (item: ICountryEntity | IError) => {
//
// }

  setMinCountryById(id: number): void {
    this.http_s.loadingMinCountryById(id).subscribe({
      next: (item: IMinCountryEntity | IError) => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.storePr2.setMinCountry(item as IMinCountryEntity);
        }
      }
    })
  }

  async addingCountry(country: FormData): Promise<ICountryEntity | null> {
    return await firstValueFrom(
      this.http_s.addCountry(country).pipe(
        map(
          async (
            res: ICountryEntity | IError
          ): Promise<ICountryEntity | null> => {
            if (this.check.isError(res)) {
              this.message.setMessage((res as IError).message);
              return null;
            } else {
              this.message.setMessage(null);
              const newCountry: ICountryEntity = res as ICountryEntity;
              this.setMinCountryById(newCountry.id);
              this.store.setCountry(newCountry);
              return newCountry;
            }
          }
        )
      )
    );
  }

  async updateCountry(country: FormData): Promise<ICountryEntity | null> {
    return await firstValueFrom(
      this.http_s.updateCountry(country).pipe(
        map(
          async (
            res: ICountryEntity | IError
          ): Promise<ICountryEntity | null> => {
            if (this.check.isError(res)) {
              this.message.setMessage((res as IError).message);
              return null;
            } else {
              this.message.setMessage(null);
              const updatedCountry: ICountryEntity = res as ICountryEntity;
              this.setMinCountryById(updatedCountry.id);
              this.store.setCountry(updatedCountry);
              return updatedCountry;
            }
          }
        )
      )
    );
  }

  async deleteCountry(id: number): Promise<boolean> {
    return await firstValueFrom(
      this.http_s.deleteCountry(id).pipe(
        map(async (res: boolean | IError): Promise<boolean> => {
          if (this.check.isError(res)) {
            this.message.setMessage((res as IError).message);
            return false;
          } else {
            this.message.setMessage(null);
            this.store.removeCountry(id);
            this.storePr2.removeMinCountry(id);
            return res as boolean;
          }
        })
      )
    );
  }
}
