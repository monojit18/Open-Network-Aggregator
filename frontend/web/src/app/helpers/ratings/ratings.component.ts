import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatTooltipModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
})
export class RatingsComponent implements OnInit {
  @Input() rating: string;
  numRating: number;
  percentage = 0;
  halfShaded = 0;
  fullShaded = 0;
  unShaded = 0;

  constructor() {}

  ngOnInit() {
    if (this.rating) {
      this.numRating = parseInt(this.rating);
      this.initFunction();
    }
  }
  initFunction() {
    this.fullShaded = Math.round(this.numRating / 0.25);
    this.fullShaded = Math.floor(this.fullShaded / 4);
    if (this.fullShaded > this.numRating) {
      this.halfShaded = 0;
    } else {
      this.halfShaded = this.numRating - this.fullShaded;
      if (this.halfShaded > 0.25) {
        this.halfShaded = 1;
      } else {
        this.halfShaded = 0;
      }
    }
    this.unShaded = 5 - (this.fullShaded + this.halfShaded);
  }
  counter(i: number) {
    if (i > 0) {
      return new Array(i);
    } else {
      return [];
    }
  }
}
