import {Component, Input, OnInit} from '@angular/core';
import {StarsRateComponent} from '../stars-rate/stars-rate.component';
import {KeyValuePipe, NgIf} from '@angular/common';
import {IHotelFeedbackEntity} from '../../../interfaces/hotels-block/i-hotel-feedback.entity';
import {UserService} from '../../../services/user.service';
import {UserStartData} from '../../../models/user-start-data';
import {IMinUser} from '../../../interfaces/i-min-user';
import {IUser} from '../../../interfaces/i-user';

@Component({
  selector: 'app-hotel-feedback',
  imports: [
    StarsRateComponent,
    KeyValuePipe,
    NgIf
  ],
  templateUrl: './hotel-feedback.component.html',
  styleUrl: './hotel-feedback.component.css'
})
export class HotelFeedbackComponent implements OnInit {

  @Input() feedback?: IHotelFeedbackEntity;
  public user?:IUser;

  constructor(private userService:UserService) {
  }

  get avgRates(): Map<string, number> {
    if(!this.feedback) {
      return new Map<string,number>();
    }
    return new Map([
      ['Локація', this.feedback.locationRating],
      ['Кімнати', this.feedback.roomsRating],
      ['Ціна', this.feedback.priceRating],
      ['Чистота', this.feedback.cleanRating],
      ['Обслуговуванная', this.feedback.serviceRating],
      ['Якість сну', this.feedback.sleepRating],
    ]);
  }

  ngOnInit(): void {
    if(this.feedback) {
      this.userService.loadingUserById(this.feedback.userId).subscribe(res=>{
        if(res!=undefined){
          console.log(res);
          this.user = res;
        }
      });
    }

  }


}
