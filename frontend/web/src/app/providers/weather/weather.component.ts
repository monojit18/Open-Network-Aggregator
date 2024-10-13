import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, TranslateModule, GenTranslatePipe],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
})
export class WeatherComponent {
  @Input() message: any;
}
