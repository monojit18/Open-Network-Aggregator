import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { LanguageTranslationService } from '../../../services/language-translation.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  standalone: true,
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent {
  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    @Inject(DOCUMENT) private document: Document,
    private languageTranslationService: LanguageTranslationService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform)) {
      // Avoid appending script multiple times
      if (!this.document.getElementById('google-translate-script')) {
        const jsElm = this.document.createElement('script');
        jsElm.id = 'google-translate-script'; // Unique ID for the script
        jsElm.type = 'application/javascript';
        jsElm.async = true;
        jsElm.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
        this.document.body.appendChild(jsElm);
      }
      // this.languageTranslationService.loadLanguage();
    }
  }

  onLanguageChange(event: any) {
    const selectedLanguage = event.target.value;
    // this.languageTranslationService.setLanguage(selectedLanguage);
  }
}
