import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatTooltip],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbackComponent implements OnInit {
  message: string;
  public commonService = inject(CommonService);
  translate = inject(TranslateService);
  selectedThumb: 'up' | 'down' | null = null;

  ngOnInit(): void {
    this.message = this.commonService.getUserMessage();
  }

  // Method to handle thumb up click
  onThumbUpClick() {
    this.selectedThumb = 'up'; // Set selected thumb to up
  }

  // Method to handle thumb down click
  onThumbDownClick() {
    this.selectedThumb = 'down'; // Set selected thumb to down
  }
  googleSearch() {
    window.open(
      `https://www.google.com/search?q=${this.translate.instant(this.message)}`,
      '_blank'
    );
  }
}
