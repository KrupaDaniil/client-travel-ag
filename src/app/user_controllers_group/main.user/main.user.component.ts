import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { IHotelImage } from '../../../interfaces/hotels-block/IHotelImage.entity';
import { IBlobImageEntity } from '../../../interfaces/country-block/i-blob-image.entity';
import { Observable } from 'rxjs';
import { ICountryEntity } from '../../../interfaces/country-block/i-country.entity';
import { CountryService } from '../../../services/country.service';
import { EntityStorage } from '../../../storage/entity.storage';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IMinCityCountryEntity } from '../../../interfaces/country-block/i-min-city-country.entity';
import { EntityStoragePr2 } from '../../../storage/entity.storage.pr2';
import { HotelService } from '../../../services/Hotels/hotel.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CityService } from '../../../services/city.service';
import { IAdminHotelEntity } from '../../../interfaces/hotels-block/i-admin-hotel.entity';

@Component({
  selector: 'app-main.user',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './main.user.component.html',
  styleUrl: './main.user.component.css'
})
export class MainUserComponent {
  private readonly store = inject(EntityStorage);
  private readonly storePr2 = inject(EntityStoragePr2);
  private readonly countryService = inject(CountryService);

  readonly countries: Signal<ICountryEntity[]> = computed(() => this.store.countriesEntities());
  readonly hotels:Signal<IAdminHotelEntity[]> = computed(() => this.storePr2.adminHotelsEntities());
  readonly cities: Signal<IMinCityCountryEntity[]> = computed(() => this.storePr2.minCityCountryEntities());
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

  public citiesIds: Number = 0;

  public filter: FormGroup = new FormGroup({
    name: new FormControl(""),
    price: new FormControl(0),
    numberOfPeople: new FormControl(0),
    cityIds: new FormControl([])
  })

  constructor(private service: HotelService, private route: ActivatedRoute, private toast: HotToastService,
    private citiesSerive: CityService, private router: Router) {
    this.loadCountriesIfEmpty();

    this.citiesIds = Number(this.route.snapshot.queryParams['cityIds']);

    this.initCities();
  }

  private initCities() {
    if (this.cities().length === 0) {
      this.citiesSerive.setAllMinCityCountry().subscribe(res => {
        if (res) {
          if (this.citiesIds) {
            this.filter.patchValue({ cityIds: Array.of(this.citiesIds) });
            console.log(this.filter.value);
          }
        }
      });
    }
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

  onSearch(): void {
    const { name, price, numberOfPeople, cityIds } = this.filter.getRawValue();

    this.service.searchHotelsByFilter(name, price, numberOfPeople, cityIds).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          if (res.length === 1) {
            const hotelId = res[0];
            this.router.navigate(['/hotels/view', hotelId]);
          } else {
            this.router.navigate(['/hotels'], {
              queryParams: { hotelIds: res }
            });
          }
        } else {
          this.toast.warning('За цими фільтрами готелі не знайденно.');
        }
      },
      error: () => this.toast.error('Search failed!')
    });
  }

  onReset(): void {
    this.filter.reset({
      name: "",
      checkin: "",
      price: 0,
      numberOfPeople: 0,
      duration: 0,
      cityIds: []
    });
    this.toast.info('Фільтри скинуто.');
  }
}
