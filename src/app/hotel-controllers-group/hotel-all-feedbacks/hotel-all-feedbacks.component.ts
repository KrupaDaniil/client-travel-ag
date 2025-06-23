import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {HotelAboutComponent} from '../hotel-about/hotel-about.component';
import {IHotelDetailsEntity} from '../../../interfaces/hotels-block/i-hotel-details.entity';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {ActivatedRoute} from '@angular/router';
import {HotelService} from '../../../services/Hotels/hotel.service';
import {HotelFeedbackComponent} from '../hotel-feedback/hotel-feedback.component';
import {ValidationService} from '../../../services/validation.service';
import {IHotelFeedbackEntity} from '../../../interfaces/hotels-block/i-hotel-feedback.entity';
import {LoadingComponent} from '../../loading/loading.component';
import {NgClass} from '@angular/common';
import {EntityStorage} from '../../../storage/entity.storage';
import {IError} from '../../../interfaces/i-error';

@Component({
  selector: 'app-hotel-all-feedbacks',
  imports: [
    HotelAboutComponent,
    HotelFeedbackComponent,
    LoadingComponent,
    NgClass
  ],
  templateUrl: './hotel-all-feedbacks.component.html',
  styleUrl: './hotel-all-feedbacks.component.css'
})
export class HotelAllFeedbacksComponent implements OnInit {
  private readonly storepr2 = inject(EntityStoragePr2);
  private readonly store = inject(EntityStorage);

  public feedbacks:Signal<IHotelFeedbackEntity[]> = computed(()=>this.storepr2.feedbacksEntities())
  public feedbacksToShow:WritableSignal<IHotelFeedbackEntity[]|null> = signal<IHotelFeedbackEntity[]|null>(null);

  public hotel?:IHotelDetailsEntity;
  private readonly hotelId?:number;

  private itemsPerPage = 10;
  public currentPage = 0;

  public isLoadingFeedbacks = false;
  get totalPages(){
    if(this.hotel){
      return Math.ceil(this.hotel.totalFeedbacks / this.itemsPerPage);
    }
    return 0;
  }

  constructor(private router: ActivatedRoute, private service:HotelService,private check: ValidationService) {
    const id = this.router.snapshot.paramMap.get("id");
    this.hotelId = id ? Number(id) : 0;
  }

  ngOnInit(): void {
    this.initHotel();
    this.initFeedbacks();
  }

  private initHotel(){
    if(this.hotelId!=0){
      let elem = this.storepr2.hotelDetailsEntities().find(el=>el.id === this.hotelId);
      if(elem) {
        this.hotel = elem as IHotelDetailsEntity;
      }
      else{
        this.service.getHotelById(this.hotelId!, 0).subscribe(res=>{
          if(res){
            this.hotel = res as IHotelDetailsEntity;
          }
        })
      }
    }
  }

  private initFeedbacks(){
    if(this.hotelId) {
      this.service.getFeedbacksByHotelId(this.hotelId).subscribe(res => {
        if (!this.check.isError(res as IError)) {
          this.storepr2.setAllHotelFeedbacks(res as IHotelFeedbackEntity[]);
          this.feedbacksToShow.set(this.feedbacksOnPage);
        }
      });
    }
  }

  public toPage(page:number){
    if(!this.hotelId){
      return;
    }
    if(page > this.totalPages-1 || page < 0){
      return;
    }
    if(this.currentPage < this.totalPages){
      this.currentPage = page;
      this.feedbacksToShow.set(this.feedbacksOnPage);
    }
  }

  get feedbacksOnPage(){
    return this.feedbacks().slice(this.currentPage * this.itemsPerPage,this.currentPage * this.itemsPerPage+this.itemsPerPage);
  }


}
