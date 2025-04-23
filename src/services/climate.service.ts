import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { IClimateEntity } from '../interfaces/country-block/i-climate.entity';
import { IError } from '../interfaces/i-error';
import { MessageService } from './message.service';
import { ValidationService } from './validation.service';
import { EntityStorage } from '../storage/entity.storage';

@Injectable({
  providedIn: 'root',
})
export class ClimateService {
  private store = inject(EntityStorage);
  constructor(
    private http_s: HttpService,
    private message: MessageService,
    private check: ValidationService
  ) {}

  addingAllClimates(): void {
    this.http_s.loadingAllClimate().subscribe({
      next: (item: IClimateEntity[] | IError) => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setAllClimates(item as IClimateEntity[]);
        }
      },
    });
  }

  addClimate(climate: IClimateEntity): void {
    this.http_s.addClimate(climate).subscribe({
      next: (item: IClimateEntity | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this.store.setClimate(item as IClimateEntity);
        }
      },
    });
  }

  deleteClimate(id: number): void {
    this.http_s.deleteClimate(id).subscribe({
      next: (item: boolean | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          if (item === true) {
            this.message.setMessage(null);
            this.store.removeClimate(id);
          }
        }
      },
    });
  }
}
