import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    SatPopoverModule,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  selectedURL: string;
  langMap: any = {
    hi: 'Hindi',
    en: 'English',
    bn: 'Bangla',
    te: 'Telugu',
    kn: 'Kannada',
    // ta: 'Tamil',
    gu: 'Gujarati',
    pa: 'Punjabi',
  };
  private localStorageService = inject(LocalStorageService);
  constructor(public translate: TranslateService) {
    const sLang =
      this.localStorageService.getLocalData('language_set_gen') || 'en';
    console.log('!!sLang', sLang);
    translate.addLangs(['en', 'hi', 'bn', 'te', 'kn', 'gu', 'pa']);
    translate.setDefaultLang(sLang);
    translate.use(sLang ? sLang : 'en');
  }

  ngOnInit(): void {}

  onLanguageChange(selected_lang: string): void {
    this.localStorageService.setLocalData(selected_lang, 'language_set_gen');
    window.location.reload();
  }

  ngOnDestroy(): void {}
}
