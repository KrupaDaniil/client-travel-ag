import {
  AfterViewChecked,
  Component,
  computed,
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

@Component({
  selector: 'app-climate-management',
  imports: [],
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

  constructor(
    private climateService: ClimateService,
    private message: MessageService,
    private render: Renderer2
  ) {}

  ngOnInit(): void {
    this.climateService.addingAllClimates();
  }

  ngAfterViewChecked(): void {}
}
