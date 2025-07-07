import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IMinCityEntity } from '../../../interfaces/country-block/i-min-city.entity';
import { CityService } from '../../../services/city.service';
import { ICityEntity } from '../../../interfaces/country-block/i-city.entity';
import { IMainCountryForCityEntity } from '../../../interfaces/country-block/i-main-country-for-city.entity';
import { IBlobImageEntity } from '../../../interfaces/country-block/i-blob-image.entity';

@Component({
  selector: 'app-cities',
  imports: [CommonModule, RouterModule],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.css'
})
export class CitiesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cityService = inject(CityService);

  private readonly citiesSignal = signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]>([]);
  private readonly loadingSignal = signal<boolean>(true);
  private readonly countryNameSignal = signal<string>('');

  readonly cities = computed(() => this.citiesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly countryName = computed(() => this.countryNameSignal());

  async ngOnInit(): Promise<void> {
    const countryId = this.route.snapshot.paramMap.get('id');
    if (countryId) {
      await this.loadCities(+countryId);
    }
  }

  private async loadCities(countryId: number): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const cities = await this.cityService.getAllCountryCities(countryId);
      if (cities) {
        //this.citiesSignal.set(cities);
        if (cities.length > 0) {
          //this.countryNameSignal.set(cities[0].country.name);
        }
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  trackByCityId(index: number, city: ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>): number {
    return city.id;
  }

  goBack(): void {
    this.router.navigate(['/countries']);
  }
}
