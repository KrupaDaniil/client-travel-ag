import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IHotelImage} from '../../../interfaces/hotels-block/IHotelImage.entity';
import {NgClass, NgIf} from '@angular/common';



@Component({
  selector: 'app-hotel-carousel',
  imports: [
    NgIf,
    NgClass,
  ],
  templateUrl: './hotel-carousel.component.html',
  styleUrl: './hotel-carousel.component.css',
  standalone:true
})
export class HotelCarouselComponent {
  @Input() images?: IHotelImage[];

  @ViewChild("modal") modal?:ElementRef;

  protected readonly Array = Array;

  public clickedItem:number = -1;

  constructor() {

  }

  openModal(imgId:number) {
    this.modal?.nativeElement.click();
    this.clickedItem = imgId;

  }


}
