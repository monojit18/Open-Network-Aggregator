import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../../services/pipes/gen-translate.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { RatingsComponent } from '../../../helpers/ratings/ratings.component';
import { HtmlTooltipDirective } from '../../../services/directive/html-tooltips.directive';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-onest-select',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    GenTranslatePipe,
    MatTooltip,
    RatingsComponent,
    HtmlTooltipDirective,
    MatButtonModule,
  ],
  templateUrl: './onest-select.component.html',
  styleUrl: './onest-select.component.scss',
})
export class OnestSelectComponent {
  @Input() message: any;
  // {
  //   "context": {
  //     "domain": "onest:learning-experiences",
  //     "version": "1.1.0",
  //     "action": "on_select",
  //     "bap_id": "seeker-dev.gcpwkshpdev.com",
  //     "bap_uri": "https://seeker-dev.gcpwkshpdev.com/bap",
  //     "bpp_id": "sandbox.onest.network/adaptor-bpp/smartlab",
  //     "bpp_uri": "https://sandbox.onest.network/adaptor-bpp/smartlab/bpp",
  //     "transaction_id": "8ee6c058-c3fd-4e87-8854-0c50394869b7",
  //     "message_id": "c79f1591-dee8-4cf7-a904-a71dd3988775",
  //     "ttl": "PT10M",
  //     "timestamp": "2023-11-30T07:17:08.9104609Z"
  //   },
  //   "message": {
  //     "order": {
  //       "provider": {
  //         "id": "PtAgriLearning",
  //         "descriptor": {
  //           "name": "PtAgriLearning"
  //         },
  //         "category_id": "5"
  //       },
  //       "items": [
  //         {
  //           "id": "304",
  //           "parent_item_id": "304",
  //           "descriptor": {
  //             "name": "Earthworm Compost",
  //             "long_desc": "Earthworm Compost",
  //             "images": [
  //               {
  //                 "url": "https://storage.googleapis.com/resources-videos/images/Earthworm%20Compost.png"
  //               }
  //             ]
  //           },
  //           "price": {
  //             "currency": "INR",
  //             "value": "500"
  //           },
  //           "category_id": "5",
  //           "recommended": false,
  //           "time": {
  //             "label": "Course Schedule",
  //             "duration": "P2M",
  //             "range": {
  //               "start": "2023-11-30T07:17:08.9105128Z",
  //               "end": "2024-01-30T07:17:08.9105128Z"
  //             }
  //           },
  //           "rating": "5",
  //           "rateable": false
  //         }
  //       ]
  //     }
  //   }
  // }
}
