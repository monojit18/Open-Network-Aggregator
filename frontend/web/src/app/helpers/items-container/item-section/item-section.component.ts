import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TruncatePipe } from '../../../services/pipes/truncate-pipe.pipe';
import { CommonModule } from '@angular/common';
import { HtmlTooltipDirective } from '../../../services/directive/html-tooltips.directive';
import { RatingsComponent } from '../../../helpers/ratings/ratings.component';
import { SafeYouTubeUrlPipe } from '../../../services/pipes/safe-you-tube-url.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { ViewMoreContainerComponent } from '../view-more-container/view-more-container.component';
import { YoutubeModalComponent } from '../../../providers/videos/youtube-modal/youtube-modal.component';
import { GenTranslatePipe } from '../../../services/pipes/gen-translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ApiClientService } from '../../../services/api-client.service';

@Component({
  selector: 'app-item-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    TruncatePipe,
    HtmlTooltipDirective,
    RatingsComponent,
    SafeYouTubeUrlPipe,
    MatMenuModule,
    ViewMoreContainerComponent,
    YoutubeModalComponent,
    GenTranslatePipe,
    TranslateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './item-section.component.html',
  styleUrl: './item-section.component.scss',
})
export class ItemSectionComponent implements OnInit {
  @Input() item: any;
  @Input() context: any;
  @Input() providerId: string;
  @Input() hasOnestFlow: boolean = true;

  videoId: any;

  private apiClient = inject(ApiClientService);
  showSpinner: boolean = false;
  showSelect: boolean = true;
  isClicked: boolean = false;
  constructor() {}
  durationInMonths(duration: string): string {
    const match = duration.match(/P(\d+)M/);
    return match ? `${match[1]} months` : '';
  }

  ngOnInit(): void {
    // this.youtube.transform;
    if (this.item?.descriptor?.media) {
      this.videoId = this.videoIdTransform(this.item?.descriptor?.media[0].url);
    }
  }
  videoIdTransform(url: string): any | null {
    let videoId: string | null = null;

    const watchRegex = /\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);

    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }
    const shortUrlRegex = /youtu\.be\/([^?]+)/;
    const shortUrlMatch = url.match(shortUrlRegex);

    if (shortUrlMatch && shortUrlMatch[1]) {
      videoId = shortUrlMatch[1];
    }

    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return videoId;
      // return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
  }
  onSelect() {
    if (this.context?.domain?.includes('onest')) {
      let payload;
      payload = {
        context: this.context,
        message: {
          order: {
            provider: {
              id: this.providerId,
            },
            items: [
              {
                id: this.item.id,
              },
            ],
          },
        },
      };
      console.log(payload, '!! this.Onselect');
      this.showSelect = false;
      this.showSpinner = true;
      this.apiClient
        .onOnestSelect(payload)
        .pipe()
        .subscribe((data) => {
          this.showSpinner = false;
          this.showSelect = true;
          this.isClicked = true;
        });
    } else {
      return;
    }
  }
  apply() {}
}
