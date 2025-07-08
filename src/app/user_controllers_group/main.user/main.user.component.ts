import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { IHotelImage } from '../../../interfaces/hotels-block/IHotelImage.entity';
import { IBlobImageEntity } from '../../../interfaces/country-block/i-blob-image.entity';
import { Observable } from 'rxjs';
import { ICountryEntity } from '../../../interfaces/country-block/i-country.entity';
import { CountryService } from '../../../services/country.service';
import { EntityStorage } from '../../../storage/entity.storage';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main.user',
  imports: [CommonModule, RouterLink],
  templateUrl: './main.user.component.html',
  styleUrl: './main.user.component.css'
})
export class MainUserComponent {
  private readonly store = inject(EntityStorage);
  private readonly countryService = inject(CountryService);

  readonly countries: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());
  private readonly currentIndex = signal(0);

  readonly visibleCountries: Signal<ICountryEntity[] | null> = computed(() => {
    const all = this.countries();
    if (all.length === 0) return null;

    const index = this.currentIndex();
    return Array.from({ length: 3 }, (_, i) => {
      const original = all[(index + i) % all.length];
      return { ...original };
    });
  });

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

  nextSlide(): void {
    const total = this.countries().length;
    if (total > 0) {
      this.currentIndex.set((this.currentIndex() + 1) % total);
    }
  }

  prevSlide(): void {
    const total = this.countries().length;
    if (total > 0) {
      this.currentIndex.set((this.currentIndex() - 1 + total) % total);
    }
  }
}
