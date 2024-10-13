import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [NgxSkeletonLoaderModule, TranslateModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {}
