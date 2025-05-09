import {
  AfterViewChecked,
  Component,
  computed, effect,
  inject,
  OnInit,
  Renderer2,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import {EntityStorage} from '../../../storage/entity.storage';
import {CityService} from '../../../services/city.service';
import {MessageService} from '../../../services/message.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NgOptimizedImage} from '@angular/common';
import {NgSelectComponent} from '@ng-select/ng-select';
import {ICityEntity} from '../../../interfaces/country-block/i-city.entity';
import {IMainCountryForCityEntity} from '../../../interfaces/country-block/i-main-country-for-city.entity';
import {IBlobImageEntity} from '../../../interfaces/country-block/i-blob-image.entity';

@Component({
  selector: 'app-city-management',
  imports: [
    FormsModule,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    NgSelectComponent,
    ReactiveFormsModule,
    NgOptimizedImage
  ],
  providers: [CityService, MessageService],
  templateUrl: './city-management.component.html',
  styleUrl: './city-management.component.css'
})
export class CityManagementComponent implements OnInit, AfterViewChecked{
  private readonly store = inject(EntityStorage);
  private isSetEntitiesFlag: boolean;

  private cityList: Signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[]> =
    computed(() => this.store.admin_citiesEntities());

  displayCityList: WritableSignal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null>;
  descriptionCity: WritableSignal<string | null>;
  imageCityUrl: WritableSignal<string | null>;
  loadingFailed: WritableSignal<boolean>

  constructor(private cityService: CityService, private message: MessageService, private render: Renderer2) {
    this.displayCityList = signal<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | null>(null);
    this.descriptionCity = signal<string | null>(null);
    this.imageCityUrl = signal<string | null>(null);
    this.loadingFailed = signal<boolean>(false);
    this.isSetEntitiesFlag = false;

    this.setDisplayEntities();
  }

  ngOnInit(): void {
    this.cityService.setAllAdminCities();
  }

  ngAfterViewChecked(): void {
  }

  setDisplayEntities(): void {
    effect(() => {
      if (this.cityList() && !this.isSetEntitiesFlag) {
        this.isSetEntitiesFlag = true;
        this.displayCityList.set(this.cityList());
        this.loadingFailed.set(false);
      } else {
        setInterval(() => {
          this.loadingFailed.set(true);
        }, 60000);
      }
    });
  }

}
