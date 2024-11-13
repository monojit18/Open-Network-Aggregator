import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-view-more-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-more-container.component.html',
  styleUrl: './view-more-container.component.scss',
})
export class ViewMoreContainerComponent {
  @Input() data: any;
}
