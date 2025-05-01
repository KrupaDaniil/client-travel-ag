import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {CountryService} from '../../../services/country.service';
import {MessageService} from '../../../services/message.service';
import {EntityStorage} from '../../../storage/entity.storage';
import {ICountryEntity} from '../../../interfaces/country-block/i-country.entity';
import {ClimateService} from '../../../services/climate.service';
import {LanguageService} from '../../../services/language.service';
import {IClimateEntity} from '../../../interfaces/country-block/i-climate.entity';
import {ILanguageEntity} from '../../../interfaces/country-block/i-language.entity';
import {FormControl, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {ValidationService} from '../../../services/validation.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NgOptimizedImage} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {NgSelectModule} from '@ng-select/ng-select';
import {ICountryRequestEntity} from '../../../interfaces/country-block/i-country-request.entity';
import {IBlobImageEntity} from '../../../interfaces/country-block/i-blob-image.entity';

@Component({
  selector: 'app-country-management',
  imports: [ReactiveFormsModule, MatSidenavContainer, MatSidenav, MatSidenavContent,
    NgOptimizedImage, MatButtonModule, NgSelectModule],
  providers: [CountryService, ClimateService, LanguageService, MessageService],
  templateUrl: './country-management.component.html',
  styleUrl: './country-management.component.css',
})
export class CountryManagementComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(EntityStorage);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  private isSelectedRow: boolean;
  loadingFailed: WritableSignal<boolean>;
  private selectedCountry: ICountryEntity | undefined;


  private countryList: Signal<ICountryEntity[]> = computed(() =>
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

  displayCountryList: WritableSignal<ICountryEntity[] | null>;
  displayDescriptionCountry: WritableSignal<string | null>;

  addCountryForm: FormGroup | undefined;
  editCountryForm: FormGroup | undefined;
  private flagImg: File | undefined;
  private requestData: FormData | undefined;
  private readonly nameProperties: string[];

  @ViewChild("addingCountryDialog") addingCountryDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild("descriptionDialog") descriptionDialog?: ElementRef<HTMLDialogElement>;

  constructor(
    private countryService: CountryService,
    private climateService: ClimateService,
    private languageService: LanguageService,
    private messages: MessageService,
    private check: ValidationService,
    private render: Renderer2
  ) {
    this.isSelectedRow = false;
    this.displayCountryList = signal<ICountryEntity[] | null>(null);
    this.loadingFailed = signal<boolean>(false);
    this.displayDescriptionCountry = signal<string | null>(null);
    this.setContent();
    this.showMessage();
    this.nameProperties = ["id", "name", "currency", "phoneCode", "flagImage", "description", "climate",
      "capitalCityName", "languages"];
  }

  ngOnInit(): void {
    this.countryService.setAllCountry();

    if (this.climateList() && this.climateList().length === 0) {
      this.climateService.addingAllClimates();
    }

    if (this.languageList() && this.languageList().length === 0) {
      this.languageService.addingAllLanguages();
    }

    this.creatingAddForm();
  }

  ngAfterViewChecked(): void {
  }

  private setContent(): void {
    effect(() => {
      const list = this.countryList();

      if (this.displayCountryList() === null) {
        if (list && list.length > 0) {
          this.displayCountryList.set(list);
          this.loadingFailed.set(false);
        } else {
          this.loadingFailed.set(true);
        }
      }
    });
  }

  private creatingAddForm(): void {
    this.addCountryForm = new FormGroup({
      name: new FormControl('', Validators.required),
      currency: new FormControl('', Validators.required),
      phoneCode: new FormControl('', Validators.required),
      description: new FormControl(''),
      climate: new FormControl<IClimateEntity | null>(
        null,
        Validators.required
      ),
      capitalCityName: new FormControl('', Validators.required),
      languages: new FormControl([], Validators.required),
    });
  }

  private creatingEditForm(): void {
    if (this.selectedCountry) {
      this.editCountryForm = new FormGroup({
        id: new FormControl(this.selectedCountry.id),
        name: new FormControl(this.selectedCountry.name),
        currency: new FormControl(this.selectedCountry.currency),
        phoneCode: new FormControl(this.selectedCountry.phoneCode),
        flagImage: new FormControl<IBlobImageEntity | null>(this.selectedCountry.flagImage),
        description: new FormControl(this.selectedCountry.description),
        climate: new FormControl<IClimateEntity | null>(
          this.selectedCountry.climate, Validators.required
        ),
        capitalCityName: new FormControl(this.selectedCountry.capitalCityName),
        languages: new FormControl(this.selectedCountry.languages, Validators.required),
      })
    }
  }

  onSelectedFile(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element && element.files && element.files.length > 0) {
      this.flagImg = element.files[0];
    } else {
      this.flagImg = undefined;
    }
  }

  private createCountry(): ICountryRequestEntity | null {
    const formResult = this.addCountryForm?.value;
    if (formResult) {
      return {
        name: formResult.name,
        currency: formResult.currency,
        phoneCode: formResult.phoneCode,
        flagImage: this.flagImg,
        description: formResult.description,
        climate: formResult.climate,
        capitalCityName: formResult.capitalCityName,
        languages: formResult.languages
      } as ICountryRequestEntity;
    } else {
      return null;
    }
  }

  protected requestCountry(): void {
    const country: ICountryRequestEntity | null = this.createCountry();
    if (country !== null) {
      this.requestData = new FormData();
      this.requestData?.append(this.nameProperties[1], country.name)
      this.requestData?.append(this.nameProperties[2], country.currency)
      this.requestData?.append(this.nameProperties[3], country.phoneCode)
      if (this.flagImg) {
        this.requestData?.append(this.nameProperties[4], country.flagImage!, country.flagImage?.name)
      }
      this.requestData?.append(this.nameProperties[5], country.description)
      this.requestData?.append(this.nameProperties[6], new Blob([JSON.stringify(country.climate)], {type: 'application/json'}))
      this.requestData?.append(this.nameProperties[7], country.capitalCityName)
      this.requestData?.append(this.nameProperties[8], new Blob([JSON.stringify(country.languages)], {type: 'application/json'}))

      this.countryService.addingCountry(this.requestData).then((result: boolean): void => {
        if (result) {
          this.displayCountryList.set(this.countryList());

          this.messages.setMessage("Country created");
          this.showMessage();
        } else {
          this.messages.setMessage("Country not created");
          this.showMessage();
        }
      })
    } else {
      this.messages.setMessage("Missing data to send");
      this.showMessage();
    }
  }

  setDescription(event: Event): void {
    const element = event.target as HTMLElement;
    const id = Number.parseInt(element.dataset['dsCountryId'] as string);
    const country: ICountryEntity | undefined = this.countryList().find((entity: ICountryEntity): ICountryEntity | undefined => {
      if (entity.id === id) {
        return entity;
      } else {
        return undefined;
      }
    })

    if (country) {
      this.displayDescriptionCountry.set(country.description);
      if (this.descriptionDialog?.nativeElement) {
        this.descriptionDialog?.nativeElement.showModal();
      }
    }
  }

  showMessage(): void {
    effect(() => {
      if (this.infoMessages() !== null) {
        this.snackBar.open(this.infoMessages() as string, 'close', {
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
        });
      }
    });
  }

  openAddCountryModal(): void {
    if (this.addingCountryDialog?.nativeElement) {
      this.addingCountryDialog?.nativeElement.showModal();
    }
  }

  closeAddCountryModal(): void {
    if (this.addingCountryDialog?.nativeElement) {
      this.addingCountryDialog?.nativeElement.close();
    }
  }

  closeDescriptionModal(): void {
    if (this.descriptionDialog?.nativeElement) {
      this.descriptionDialog?.nativeElement.close();
    }
  }
}
