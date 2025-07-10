import {Component, Input, OnInit} from '@angular/core';
import {StarsComponent} from '../stars/stars.component';
import {IHotelEntity} from '../../../interfaces/hotels-block/i-hotel.entity';

import {ICountryEntity} from '../../../interfaces/country-block/i-country.entity';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

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
export class HotelCardComponent implements OnInit {
  @Input() hotel?:IHotelEntity;
  constructor() {

  }

  ngOnInit(): void {

  }


}
