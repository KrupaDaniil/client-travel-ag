import {
  AfterViewChecked,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  Signal,
  ViewChild,
} from '@angular/core';
import { EntityStorage } from '../../../storage/entity.storage';
import { ClimateService } from '../../../services/climate.service';
import { MessageService } from '../../../services/message.service';
import { IClimateEntity } from '../../../interfaces/country-block/i-climate.entity';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-climate-management',
  imports: [ReactiveFormsModule],
  providers: [ClimateService, MessageService],
  templateUrl: './climate-management.component.html',
  styleUrl: './climate-management.component.css',
})
export class ClimateManagementComponent implements OnInit, AfterViewChecked {
  private readonly store = inject(EntityStorage);
  climatesList: Signal<IClimateEntity[]> = computed(() =>
    this.store.climatesEntities()
  );
  showError: Signal<string | null> = computed(() => this.message.message());

  climateName: FormControl;

  @ViewChild('addClimateBlock') addClimateBlock?: ElementRef<HTMLDivElement>;
  @ViewChild('buttonsGroup') buttonsGroup?: ElementRef<HTMLDivElement>;
  @ViewChild('addClimateBtn') addClimateBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('removeClimateBtn')
  removeClimateBtn?: ElementRef<HTMLButtonElement>;
  constructor(
    private climateService: ClimateService,
    private message: MessageService,
    private render: Renderer2
  ) {
    this.climateName = new FormControl('', Validators.required);
  }

  ngOnInit(): void {
    this.climateService.addingAllClimates();
  }

  ngAfterViewChecked(): void {
    this.showAddClimateBlock();
  }

  private showAddClimateBlock(): void {
    if (
      this.addClimateBlock?.nativeElement &&
      this.addClimateBtn?.nativeElement
    ) {
      this.render.listen(this.addClimateBtn.nativeElement, 'click', () => {
        this.render.addClass(this.buttonsGroup?.nativeElement, 'hide-block');
        this.render.addClass(this.addClimateBlock?.nativeElement, 'show-block');
      });
    }
  }

  createClimate(): void {
    if (this.climateName.value) {
      this.climateService.addClimate({
        id: 0,
        name: this.climateName.value,
      } as IClimateEntity);

      this.climateName.reset();
    }
  }

  cancel(): void {
    this.render.removeClass(this.addClimateBlock?.nativeElement, 'show-block');
    this.render.removeClass(this.buttonsGroup?.nativeElement, 'hide-block');
  }
}
