import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { GenTranslatePipe } from '../../../services/pipes/gen-translate.pipe';
import { TruncatePipe } from '../../../services/pipes/truncate-pipe.pipe';
import { HtmlTooltipDirective } from '../../../services/directive/html-tooltips.directive';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-ondc-cards',
  standalone: true,
  imports: [
    CommonModule,
    GenTranslatePipe,
    TruncatePipe,
    HtmlTooltipDirective,
    TranslateModule,
    MatButtonModule,
    MatTooltip,
  ],
  templateUrl: './ondc-cards.component.html',
  styleUrl: './ondc-cards.component.scss',
})
export class OndcCardsComponent {
  @Input() i: any;
  @Input() baseUrl: string;
}
