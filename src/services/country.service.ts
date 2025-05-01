import {inject, Injectable} from '@angular/core';
import {EntityStorage} from '../storage/entity.storage';
import {HttpService} from './http.service';
import {MessageService} from './message.service';
import {ValidationService} from './validation.service';
import {ICountryEntity} from '../interfaces/country-block/i-country.entity';
import {firstValueFrom, map} from 'rxjs';
import {IError} from '../interfaces/i-error';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly store = inject(EntityStorage);

  constructor(
    private http_s: HttpService,
    private message: MessageService,
    private check: ValidationService
  ) {
  }

  setAllCountry(): void {
    this.http_s.loadingAllCountry().subscribe({
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

  async addingCountry(country: FormData): Promise<boolean> {
    return await firstValueFrom(
      this.http_s.addCountry(country).pipe(
        map(
          async (
            res: ICountryEntity | IError
          ): Promise<boolean> => {
            if (this.check.isError(res)) {
              this.message.setMessage((res as IError).message);
              return false;
            } else {
              this.message.setMessage(null);
              this.store.setCountry(res as ICountryEntity);
              return true;
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
              this.store.setCountry(res as ICountryEntity);
              return res as ICountryEntity;
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
            return res as boolean;
          }
        })
      )
    );
  }
}
