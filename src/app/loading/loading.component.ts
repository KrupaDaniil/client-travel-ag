import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent {

  failedLoading:boolean = false;
  @Input() cancelationToken:boolean = true;

  constructor() {
    setTimeout(()=>{
      if(this.cancelationToken){
        this.failedLoading = true;
      }
     },15000);
  }

  reload() {
    window.location.reload();
    this.cancelationToken = true;
    this.failedLoading = false;
  }
}
