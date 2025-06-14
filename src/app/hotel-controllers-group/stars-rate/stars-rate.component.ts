import {Component, Input} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-stars-rate',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './stars-rate.component.html',
  styleUrl: './stars-rate.component.css'
})
export class StarsRateComponent {
  @Input() rating: number = 0;
  @Input() size: number = 24;
  fullStars: number[] = [];
  hasHalfStar: boolean = false;
  emptyStars: number[] = [];

  ngOnChanges(): void {
    const full = Math.floor(this.rating);
    const half = this.rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    this.fullStars = Array(full).fill(0);
    this.hasHalfStar = half;
    this.emptyStars = Array(empty).fill(0);
  }

}
