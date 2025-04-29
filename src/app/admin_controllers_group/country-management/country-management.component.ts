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
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-country-management',
  imports: [ReactiveFormsModule, MatSidenavContainer, MatSidenav, MatSidenavContent,
    NgOptimizedImage, MatButtonModule, MatFormField, MatSelect, MatOption, MatLabel],
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

  @ViewChild("addingCountryDialog") addingCountryDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild("closeAddCountryBtn") closeCountryBtn?: MatButton;

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
      capitalCity: new FormControl('', Validators.required),
      languages: new FormControl<ILanguageEntity[]>(
        [],
        this.check.validationLanguage
      ),
    });
  }

  onSelectedFile(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element && element.files && element.files.length > 0) {
      this.flagImg = element.files[0];
    } else {
      this.flagImg = undefined;
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

  protected readonly console = console;
}
