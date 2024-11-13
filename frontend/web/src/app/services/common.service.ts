import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private saMasterStore: any = {};
  masterDataEmitter = new Subject<void>();
  changeTransactionIdEmitter = new Subject<void>();
  currentTransactionId: string;
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  userMessage: string;
  // History property to store conversation history
  public history: any[] = [];

  constructor() {}

  // Add data to the master store and notify changes
  addDataToMaster(transactionId: string, messageId: string, data: any) {
    this.userMessage =
      JSON.parse(JSON.stringify(data))?.data?.userInput || this.userMessage;
    console.log(
      '!! userMessage',
      JSON.parse(JSON.stringify(data))?.data?.userInput,
      this.userMessage
    );
    const removeRef = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues
    if (!this.saMasterStore[transactionId]) {
      this.saMasterStore[transactionId] = {};
    }
    if (!this.saMasterStore[transactionId][messageId]) {
      this.saMasterStore[transactionId][messageId] = [];
    }
    this.saMasterStore[transactionId][messageId].push(removeRef);

    // Notify subscribers of updates
    this.masterDataEmitter.next();
    console.log('!!Updated saMasterStore:', this.saMasterStore[transactionId]);
  }
  getUserMessage() {
    return this.userMessage;
  }

  // Retrieve data for a specific transaction
  getDataFromMaster(transactionId: string) {
    return this.saMasterStore[transactionId] || {};
  }

  // Clears the entire master data and triggers page reload
  clearMaster() {
    this.saMasterStore = {};
    this.masterDataEmitter.next(); // Notify subscribers that the store was cleared
    this.reloadPage(); // Reload the page to reflect changes
  }

  // Update conversation history
  updateHistory(newHistories: any[]) {
    this.history = newHistories;
  }

  // Clear history
  clearHistory() {
    this.history = [];
  }

  // Get current conversation history
  getHistory() {
    return this.history;
  }

  // Generates a new unique transaction ID
  generateUUID() {
    return uuidv4();
  }

  // Reloads the page and emits transaction ID change
  reloadPage() {
    console.log('Page reloaded');
    this.changeTransactionIdEmitter.next(); // Notify that the transaction ID has changed
    window.location.reload();
  }

  // Optionally, navigate to a specific route if needed instead of reloading
  navigateToRoute(route: string) {
    this.router.navigate([route]);
  }

  formatTextAsSafeHtml(text: string): SafeHtml {
    const formattedText = this.formatTextAsString(text);
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }

  formatTextAsString(text: string): string {
    if (!text) return '';

    let formattedText = text.replace(
      /## (.*$)/gim,
      '<div style="border-bottom: 1px solid rgba(65, 106, 217, 0.2392156863);padding: 0 0 10px 0px"><h5 class="tw-m-0">$1</h5></div>'
    );

    formattedText = formattedText.replace(
      /\*\*(.*)\*\*/gim,
      '<strong class="tw-text-sm tw-font-semibold">$1</strong>'
    );

    formattedText = formattedText.replace(
      /^\* (.*$)/gim,
      '<li class="tw-text-sm">$1</li>'
    );
    formattedText = `<ul class="tw-text-sm">${formattedText}</ul>`;

    formattedText = formattedText.replace(
      /(#(?:[0-9a-fA-F]{3}){1,2})/g,
      '<span style="background:$1;" class="tw-w-4 tw-h-4 tw-rounded-md tw-inline-block"></span>'
    );

    formattedText = formattedText.replace(
      /<li class="tw-text-sm">(.*?)<\/li>\n?/gim,
      '<li class="tw-text-sm">$1</li>'
    );

    formattedText = formattedText.replace(/\n+/gim, '<br>');

    return formattedText.trim();
  }
}
