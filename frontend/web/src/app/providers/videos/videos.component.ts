import { Component, inject, Input, OnInit } from '@angular/core';
import { socketOnVideo } from '../../generative/generative-interaction/mockData';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SafeYouTubeUrlPipe } from '../../services/pipes/safe-you-tube-url.pipe';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TruncatePipe } from '../../services/pipes/truncate-pipe.pipe';
import { HtmlTooltipDirective } from '../../services/directive/html-tooltips.directive';
import { YoutubeModalComponent } from './youtube-modal/youtube-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NinjaModalComponent } from './ninja-modal/ninja-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { ApnaModalComponent } from './apna-modal/apna-modal.component';

interface Video {
  title: string;
  videoId: string;
  channelTitle: string;
  description: string;
  channelId: string;
  thumbnails: any;
  preview_url: string;
  long_desc: string;
  short_desc: string;
  embedUrl: string;
}

interface Provider {
  videos: Video[];
  descriptor: any;
  catalog: any;
}

interface Message {
  provider: Provider;
}

export interface SocketOnVideo {
  message: Message;
  context: any;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    SafeYouTubeUrlPipe,
    TruncatePipe,
    HtmlTooltipDirective,
    YoutubeModalComponent,
    MatDialogModule,
    TranslateModule,
    GenTranslatePipe,
    ApnaModalComponent,
  ],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent implements OnInit {
  @Input() message: SocketOnVideo;
  isYouTube: boolean = false;
  isNinjaCart: boolean = false;
  isApna: boolean = false;
  showAll: boolean = false;
  private dialog = inject(MatDialog);
  constructor(private sanitizer: DomSanitizer) {}
  ngOnInit(): void {
    console.log('!! On videos message', this.message);

    this.isYouTube =
      this.message.message.provider.descriptor?.name.includes('Youtube') ||
      false;
    this.isNinjaCart =
      this.message.message.provider.descriptor?.name.includes('Ninjacart') ||
      false;
    this.isApna =
      this.message.message.provider?.catalog?.descriptor?.name.includes(
        'Apna'
      ) || false;
  }
  safeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openNinja(item: Video) {
    const dialogRef = this.dialog.open(NinjaModalComponent, {
      width: '400px',
      data: item.embedUrl,
    });
    dialogRef.componentInstance.embedUrl = item.embedUrl;
  }
}
