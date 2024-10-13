import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyloadService {
  constructor(
    @Inject(PLATFORM_ID) private platform: any,
    private injector: Injector
  ) {}

  loadCss(styleUrl: string, callback: any) {
    if (isPlatformBrowser(this.platform)) {
      const styleElement = document.createElement('link');
      styleElement.href = styleUrl;
      styleElement.onload = callback;
      styleElement.rel = 'stylesheet';
      document.getElementsByTagName('head')[0].appendChild(styleElement);
    }
  }

  loadScript(scriptUrl: string, callback: any) {
    if (isPlatformBrowser(this.platform)) {
      const scriptElement = document.createElement('script');
      scriptElement.type = 'application/javascript';
      scriptElement.src = scriptUrl;
      scriptElement.async = true;
      scriptElement.onload = callback;
      document.body.appendChild(scriptElement);
    }
  }
}
