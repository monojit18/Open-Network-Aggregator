import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { YoutubeModalComponent } from '../youtube-modal/youtube-modal.component';
import { SafeYouTubeUrlPipe } from '../../../services/pipes/safe-you-tube-url.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TruncatePipe } from '../../../services/pipes/truncate-pipe.pipe';
import { GenTranslatePipe } from '../../../services/pipes/gen-translate.pipe';

@Component({
  selector: 'app-apna-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    YoutubeModalComponent,
    SafeYouTubeUrlPipe,
    MatTooltipModule,
    TruncatePipe,
    GenTranslatePipe,
  ],
  templateUrl: './apna-modal.component.html',
  styleUrl: './apna-modal.component.scss',
})
export class ApnaModalComponent implements OnInit {
  videoId: string;
  @Input() item: any;
  ngOnInit(): void {
    if (this.item.videos[0].url) {
      this.videoId = this.videoIdTransform(this.item.videos[0].url);
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
}
