import { Component, Input, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { CommonModule } from '@angular/common';
import { ItemsContainerComponent } from '../../helpers/items-container/items-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-onest',
  standalone: true,
  imports: [
    ItemsContainerComponent,
    TranslateModule,
    GenTranslatePipe,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './onest.component.html',
  styleUrl: './onest.component.scss',
})
export class OnestComponent {
  @Input() generated: any;
}
