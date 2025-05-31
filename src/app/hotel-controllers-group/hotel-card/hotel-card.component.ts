import { Component } from '@angular/core';
import {StarsComponent} from '../stars/stars.component';

@Component({
  selector: 'app-hotel-card',
  imports: [
    StarsComponent
  ],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css'
})
export class HotelCardComponent {

}
