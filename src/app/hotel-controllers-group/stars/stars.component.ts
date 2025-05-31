import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-stars',
  imports: [
    NgForOf,
    NgStyle
  ],
  templateUrl: './stars.component.html',
  styleUrl: './stars.component.css'
})
export class StarsComponent implements OnInit {

  @Input() rate?:number;
  public percentage:number = 0;

  ngOnInit(): void {
    if(this.rate){
      this.percentage = 100 - (this.rate * 100 / 5);
    }
  }



}
