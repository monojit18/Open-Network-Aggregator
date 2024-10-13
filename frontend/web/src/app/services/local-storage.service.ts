import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(@Inject(PLATFORM_ID) private platform: any) {}

  setLocalData(dataToBeStored: any, variable: string): void {
    if (isPlatformBrowser(this.platform)) {
      try {
        window.localStorage.setItem(variable, JSON.stringify(dataToBeStored));
      } catch (error) {
        console.error('Error setting localStorage item', error);
      }
    }
  }

  getLocalData(variable: string): any {
    if (isPlatformBrowser(this.platform)) {
      try {
        const item = window.localStorage.getItem(variable);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error parsing JSON from localStorage', error);
        return null;
      }
    }
    return null;
  }

  setLocalDataWithExpiry(key: string, value: any, expPeriod: number): void {
    if (isPlatformBrowser(this.platform)) {
      try {
        const expDate = new Date();
        const item = {
          value: value,
          expiry: expDate.getTime() + expPeriod * 24 * 60 * 60 * 1000, // expiry period in ms
        };
        window.localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error('Error setting localStorage item with expiry', error);
      }
    }
  }

  getLocalDataWithExpiry(key: string): any {
    if (isPlatformBrowser(this.platform)) {
      try {
        const itemStr = window.localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = new Date().getTime();

        if (now > item.expiry) {
          window.localStorage.removeItem(key); // Remove expired item
          return null;
        }

        return item.value;
      } catch (error) {
        console.error('Error retrieving localStorage item with expiry', error);
        return null;
      }
    }
    return null;
  }
}
