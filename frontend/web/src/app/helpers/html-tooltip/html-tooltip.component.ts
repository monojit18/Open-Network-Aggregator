import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-html-tooltip',
  standalone: true,
  imports: [],
  templateUrl: './html-tooltip.component.html',
  styleUrl: './html-tooltip.component.scss',
})
export class HtmlTooltipComponent {
  @Input() htmlContent: string | null = '';
}
