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
  private isSelectedRow: boolean;
  private selectedClimate: IClimateEntity | undefined;

  @ViewChild('addClimateBlock') addClimateBlock?: ElementRef<HTMLDivElement>;
  @ViewChild('buttonsGroup') buttonsGroup?: ElementRef<HTMLDivElement>;
  @ViewChild('addClimateBtn') addClimateBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('removeClimateBtn')
  removeClimateBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('climateBlock') climateBlock?: ElementRef<HTMLTableSectionElement>;
  constructor(
    private climateService: ClimateService,
    private message: MessageService,
    private render: Renderer2
  ) {
    this.climateName = new FormControl('', Validators.required);
    this.isSelectedRow = false;
  }

  ngOnInit(): void {
    this.climateService.addingAllClimates();
  }

  ngAfterViewChecked(): void {
    this.selectedTableRow();
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

  private selectedTableRow(): void {
    if (this.climateBlock?.nativeElement && !this.isSelectedRow) {
      this.render.listen(
        this.climateBlock.nativeElement,
        'click',
        (e: Event) => {
          const t = e.target as HTMLElement;
          if (t.tagName.toLowerCase() === 'td') {
            const r = t.closest('tr') as HTMLTableRowElement;
            if (r) {
              const radio = r.querySelector(
                'input[type="radio"]'
              ) as HTMLInputElement;
              if (radio) {
                this.render.setProperty(radio, 'checked', true);
              }

              const selectedId = Number.parseInt(
                r.dataset['climateId'] as string
              );

              this.climatesList()!.forEach((climate: IClimateEntity): void => {
                if (climate.id === (selectedId as number)) {
                  this.selectedClimate = climate;
                  return;
                }
              });

              if (this.selectedClimate) {
                if (this.removeClimateBtn?.nativeElement) {
                  this.render.listen(
                    this.removeClimateBtn.nativeElement,
                    'click',
                    () => {
                      if (this.selectedClimate?.id) {
                        this.climateService.deleteClimate(
                          this.selectedClimate.id
                        );
                        this.selectedClimate = undefined;
                        this.isSelectedRow = false;
                        this.render.setProperty(
                          this.climateBlock!.nativeElement,
                          'checked',
                          false
                        );
                      }
                    }
                  );
                }
              }
            }
          }
        }
      );
    }
  }
}
