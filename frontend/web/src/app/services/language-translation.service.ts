// import { CookieService } from './cookie.service';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
// import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageTranslationService {
  googleTranslationInit() {
    (window as any).googleTranslateElementInit =
      this.googleTranslateElementInit;
  }

  loadLanguage() {
    (window as any).googleTranslateElementInit =
      this.googleTranslateElementInit;
    const jsElm = this.document.createElement('script');
    jsElm.type = 'application/javascript';
    jsElm.async = true;
    jsElm.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
    this.document.body.appendChild(jsElm);
  }
  googleTranslateElementInit() {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        layout: (window as any).google.translate.TranslateElement.FloatPosition
          .TOP_LEFT,
      },
      'google_translate_element'
    );
  }
  constructor(@Inject(DOCUMENT) private document: Document) {}
}
