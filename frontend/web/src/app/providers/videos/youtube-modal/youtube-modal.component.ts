import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-youtube-modal',
  templateUrl: './youtube-modal.component.html',
  styleUrls: ['./youtube-modal.component.scss'],
  imports: [MatDialogModule],
  standalone: true,
})
export class YoutubeModalComponent implements OnInit {
  VideoId: string;
  player: any;
  @ViewChild('content') modalContent: TemplateRef<any>;

  constructor(private modalService: MatDialog) {}

  ngOnInit() {}

  createPlayer(videoId: string, startSeconds?: number, endSeconds?: number) {
    this.VideoId = videoId;

    // TODO: set a unique player id, in case we need multiple player instances.
    this.player = new (window as any).YT.Player('player', {
      width: '100%',
      videoId: videoId,
      playerVars: { rel: 0 },
      events: {
        onReady: this.onPlayerReady.bind(this),
      },
    });
  }

  onPlayerReady(event: any) {
    event.target.cueVideoById({
      videoId: this.VideoId,
      // startSeconds: this.startTime || 0,
      // endSeconds: this.endTime || 0,
    });
    event.target.playVideo();
  }

  openPlayer(videoId: string, startSeconds?: number, endSeconds?: number) {
    if (this.player) {
      this.createPlayer(videoId, startSeconds, endSeconds);
    }

    this.modalService.open(this.modalContent, {
      width: '600px',
      data: { videoId, startSeconds, endSeconds },
    });

    if ((window as any).YT) {
      this.createPlayer(videoId, startSeconds, endSeconds);
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        this.createPlayer(videoId, startSeconds, endSeconds);
      };
      this.loadYouTubeApi();
    }
  }

  loadYouTubeApi() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onload = () => {
      if ((window as any).onYouTubeIframeAPIReady) {
        (window as any).onYouTubeIframeAPIReady();
      }
    };
    document.body.appendChild(script);
  }

  stopPlayer() {
    if (this.player) {
      this.player.stopVideo();
    }
  }
}
