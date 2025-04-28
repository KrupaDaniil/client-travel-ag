import {
  AfterViewChecked,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { CountryService } from '../../../services/country.service';
import { MessageService } from '../../../services/message.service';
import { EntityStorage } from '../../../storage/entity.storage';
import { ICountryEntity } from '../../../interfaces/country-block/i-country.entity';
import { ClimateService } from '../../../services/climate.service';
import { LanguageService } from '../../../services/language.service';
import { IClimateEntity } from '../../../interfaces/country-block/i-climate.entity';
import { ILanguageEntity } from '../../../interfaces/country-block/i-language.entity';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-country-management',
  imports: [ReactiveFormsModule],
  providers: [CountryService, ClimateService, LanguageService, MessageService],
  templateUrl: './country-management.component.html',
  styleUrl: './country-management.component.css',
})
export class CountryManagementComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(EntityStorage);

  private isSelectedRow: boolean;
  private selectedCountry: ICountryEntity | undefined;

  countryList: Signal<ICountryEntity[]> = computed(() =>
    this.store.countriesEntities()
  );
  readonly climateList: Signal<IClimateEntity[]> = computed(() =>
    this.store.climatesEntities()
  );
  readonly languageList: Signal<ILanguageEntity[]> = computed(() =>
    this.store.languagesEntities()
  );

  readonly infoMessages: Signal<string | null> = computed(() =>
    this.messages.message()
  );

  constructor(
    private countryService: CountryService,
    private climateService: ClimateService,
    private languageService: LanguageService,
    private messages: MessageService
  ) {
    this.isSelectedRow = false;
  }

  ngOnInit(): void {
    this.countryService.setAllCountry();

    if (this.climateList() && this.climateList().length === 0) {
      this.climateService.addingAllClimates();
    }

    if (this.languageList() && this.languageList().length === 0) {
      this.languageService.addingAllLanguages();
    }
  }

  ngAfterViewChecked(): void {}
}
