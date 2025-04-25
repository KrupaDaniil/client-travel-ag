import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { MessageService } from './message.service';
import { EntityStorage } from '../storage/entity.storage';
import { ILanguageEntity } from '../interfaces/country-block/i-language.entity';
import { IError } from '../interfaces/i-error';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly store = inject(EntityStorage);

  constructor(
    private http_s: HttpService,
    private messageService: MessageService,
    private check: ValidationService
  ) {}

  addingAllLanguages(): void {
    this.http_s.loadingAllLanguage().subscribe({
      next: (item: ILanguageEntity[] | IError) => {
        if (this.check.isError(item)) {
          this.messageService.setMessage((item as IError).message);
        } else {
          this.messageService.setMessage(null);
          this.store.setAllLanguages(item as ILanguageEntity[]);
        }
      },
    });
  }

  addLanguage(language: string): void {
    this.http_s
      .addLanguage({ id: 0, name: language } as ILanguageEntity)
      .subscribe({
        next: (item: ILanguageEntity | IError) => {
          if (this.check.isError(item)) {
            this.messageService.setMessage((item as IError).message);
          } else {
            this.messageService.setMessage(null);
            this.store.setLanguage(item as ILanguageEntity);
          }
        },
      });
  }

  removeLanguage(id: number): void {
    this.http_s.deleteLanguage(id).subscribe({
      next: (item: boolean | IError) => {
        if (this.check.isError(item)) {
          this.messageService.setMessage((item as IError).message);
        } else {
          this.messageService.setMessage(null);
          this.store.removeLanguage(id);
        }
      },
    });
  }
}
