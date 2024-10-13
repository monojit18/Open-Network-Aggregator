import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TruncatePipe } from '../../services/pipes/truncate-pipe.pipe';
import { MatButtonModule } from '@angular/material/button';
import { HtmlTooltipDirective } from '../../services/directive/html-tooltips.directive';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
// import { OndcModel } from '../../generative/generative-interaction/mockData';
import { MatTooltip } from '@angular/material/tooltip';
import { CommonService } from '../../services/common.service';
import { OndcCardsComponent } from './ondc-cards/ondc-cards.component';

interface DataModel {
  data: any[];
  fileBaseUrl: string;
}
interface MessageModel {
  provider: DataModel | null;
}
interface OndcModel {
  message: MessageModel | null;
}
@Component({
  selector: 'app-ondc',
  standalone: true,
  imports: [
    CommonModule,
    TruncatePipe,
    MatButtonModule,
    HtmlTooltipDirective,
    TranslateModule,
    GenTranslatePipe,
    MatTooltip,
    OndcCardsComponent,
  ],
  templateUrl: './ondc.component.html',
  styleUrl: './ondc.component.scss',
})
export class OndcComponent implements OnInit {
  @Input() message: OndcModel;
  arrLength: number = 0;
  showAll: boolean = false;
  constructor(public commonService: CommonService) {}
  ngOnInit(): void {
    this.arrLength = this.message.message?.provider?.data?.length || 0;
  }
}
