import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { ICountryEntity } from '../../../interfaces/country-block/i-country.entity';
import { EntityStorage } from '../../../storage/entity.storage';
import { CountryService } from '../../../services/country.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-country-cards',
  imports: [CommonModule, RouterLink],
  templateUrl: './country-cards.component.html',
  styleUrl: './country-cards.component.css'
})
export class CountryCardsComponent {
  private readonly store = inject(EntityStorage);
  private readonly countryService = inject(CountryService);

  readonly countries: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());

  @ViewChild("top") top!: ElementRef;

  constructor() {
    this.loadCountriesIfEmpty();
  }

  private loadCountriesIfEmpty(): void {
    effect(() => {
      if (this.countries().length === 0) {
        this.countryService.setAllCountry();
      }
    });
  }

  trackByCountryId(index: number, country: ICountryEntity): number {
    return country.id;
  }
}
