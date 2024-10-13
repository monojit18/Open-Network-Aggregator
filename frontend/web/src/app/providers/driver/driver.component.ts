import { Component, Input } from '@angular/core';
import { driverJobMock } from '../../generative/generative-interaction/mockData';
import { ItemsContainerComponent } from '../../helpers/items-container/items-container.component';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    ItemsContainerComponent,
    TranslateModule,
    GenTranslatePipe,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss',
})
export class DriverComponent {
  @Input() generated: any;
}
