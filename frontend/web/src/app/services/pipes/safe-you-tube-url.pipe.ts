import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeYouTubeUrl',
  standalone: true,
})
export class SafeYouTubeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl | null {
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

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
