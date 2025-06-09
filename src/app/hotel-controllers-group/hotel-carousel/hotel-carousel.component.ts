import {Component, Input} from '@angular/core';
import {IHotelImage} from '../../../interfaces/hotels-block/IHotelImage.entity';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-hotel-carousel',
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './hotel-carousel.component.html',
  styleUrl: './hotel-carousel.component.css'
})
export class HotelCarouselComponent {
  @Input() images?: IHotelImage[];


  protected readonly Array = Array;
}
