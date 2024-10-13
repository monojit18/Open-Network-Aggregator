import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { map, Observable, of, shareReplay } from 'rxjs';

@Pipe({
  name: 'translateText',
  pure: false,
  standalone: true,
})
export class GenTranslatePipe implements PipeTransform {
  private http = inject(HttpClient);
  private localStorageService = inject(LocalStorageService);
  private translateUrl = 'https://apps.gcpwkshpdev.com/translate/text?trg=';
  private translationCache: { [key: string]: Observable<string> } = {};
  transform(value: string): Observable<string> {
    const languageSet =
      this.localStorageService.getLocalData('language_set_gen') || 'en';

    if (
      languageSet === 'hi' ||
      languageSet === 'bn' ||
      languageSet === 'te' ||
      languageSet === 'kn' ||
      languageSet === 'ta' ||
      languageSet === 'pa' ||
      languageSet === 'gu'
    ) {
      // Check if the translation for this text already exists in the cache
      if (this.translationCache[value]) {
        return this.translationCache[value]; // Return cached observable if available
      }

      const headers = new HttpHeaders({
        'mime-type': 'text/plain',
        'Content-Type': 'application/json',
      });

      const body = [value];

      const translation$ = this.http
        .post<any>(this.translateUrl + languageSet, body, { headers })
        .pipe(
          map((response: any) => {
            if (response && response.results && response.results.length > 0) {
              return response.results[0].target;
            }
            return value;
          }),
          shareReplay(1)
        );

      this.translationCache[value] = translation$;

      return translation$;
    }

    // If the language is not 'hi', return the original text wrapped in an observable
    return of(value);
  }
}
