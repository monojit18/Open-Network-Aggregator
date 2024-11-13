import { Component, EventEmitter, inject, Output, output } from '@angular/core';
import { VideosComponent } from '../../providers/videos/videos.component';
import { TranslateModule } from '@ngx-translate/core';

interface promptValue {
  exPrompt: string;
  key: string;
  icon: string;
}
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [VideosComponent, TranslateModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Output() onSearchClick = new EventEmitter();
  emptyDemoMap: promptValue[] = [
    {
      exPrompt: 'EMPTY.SHOW_AGRI',
      key: 'courses',
      icon: 'agriculture',
    },
    {
      exPrompt: 'EMPTY.SUGGEST_JAVA_FRESHER',
      key: 'jobs',
      icon: 'work',
    },
    {
      exPrompt: 'EMPTY.VIDEOS_ON_RICE',
      key: 'videos',
      icon: 'tv_gen',
    },
    {
      exPrompt: 'EMPTY.WEATHER_BENGALURU',
      key: 'weather',
      icon: 'cloud',
    },
  ];
  onSearch(item: promptValue) {
    this.onSearchClick.emit(item.exPrompt);
  }
}
