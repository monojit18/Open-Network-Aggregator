import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  // public http = Inject(HttpClient)
  constructor(private http: HttpClient) {}

  onSearch(
    payload: any,
    messageId = 'abc-123456',
    transactionId: string = '27367140-b61f-49e0-a8e6-cdbe1015cdi'
  ) {
    return this.http.post(`${environment.BAP_URI}/search`, {
      transactionId: transactionId,
      messageId: messageId,
      ...payload,
    });
  }
  onMandiSearch() {
    return this.http.get(
      `https://webhook-988940411658.us-central1.run.app/api/govtdata/mandi/price?state=Karnataka&district=Bangalore&comodity=Rice`,
      {}
    );
  }

  onOnestSelect(payload: { context: any; message: any }) {
    return this.http.post(`${environment.BAP_URI}/select`, payload);
  }
}
