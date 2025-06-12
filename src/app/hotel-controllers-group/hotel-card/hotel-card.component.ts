import {Component, Input} from '@angular/core';
import {StarsComponent} from '../stars/stars.component';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';
import {NgIf} from '@angular/common';
import {ICountryEntity} from '../../../interfaces/country-block/i-country.entity';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-hotel-card',
  imports: [
    StarsComponent,
    NgIf,
    RouterLink
  ],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css'
})
export class HotelCardComponent {
  @Input() hotel?:IHotelEntity;
  @Input() country?:ICountryEntity;



}
