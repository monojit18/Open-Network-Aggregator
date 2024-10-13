import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
  AfterViewInit,
  viewChild,
  inject,
  OnInit,
} from '@angular/core';
import { LazyloadService } from '../../services/lazyload.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TruncatePipe } from '../../services/pipes/truncate-pipe.pipe';
import { HtmlTooltipDirective } from '../../services/directive/html-tooltips.directive';
import { RatingsComponent } from '../../helpers/ratings/ratings.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SafeYouTubeUrlPipe } from '../../services/pipes/safe-you-tube-url.pipe';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import { ViewMoreContainerComponent } from './view-more-container/view-more-container.component';
import { ItemSectionComponent } from './item-section/item-section.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-items-container',
  standalone: true,
  imports: [
    CommonModule,
    ItemSectionComponent,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './items-container.component.html',
  styleUrls: ['./items-container.component.scss'],
})
export class ItemsContainerComponent implements OnInit, AfterViewInit {
  readonly menuTrigger = viewChild.required(MatMenuTrigger);
  showAll: boolean = false;
  readonly dialog = inject(MatDialog);
  @Input() data: any;
  @Input() context: any;
  @Input() providerId: string;
  @Input() hasOnestFlow: boolean = true;
  carouselOptions: any;

  constructor(
    // @Inject(PLATFORM_ID) private platformId: Object,
    // private lazyloadService: LazyloadService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    console.log('!! this.context', this.providerId, this.context);
    // this.carouselOptions = {
    //   type: this.data?.length > 3 ? 'loop' : 'slide',
    //   gap: 5,
    //   perPage: this.data?.length > 3 ? 3 : this.data.length,
    // };
  }

  ngAfterViewInit(): void {
    // if (
    //   isPlatformBrowser(this.platformId) &&
    //   this.compId &&
    //   this.data.length > 2
    // ) {
    //   if ((window as any).Splide) {
    //     this.splideOnInit();
    //   } else {
    //     this.loadCSSAndScript();
    //   }
    // }
  }
  // getEmbeddedYouTubeURL(url: string) {
  //   const regex = /\/watch\?v=([^&]+)/;
  //   const match = url.match(regex);

  //   if (match && match[1]) {
  //     const videoId = match[1];
  //     const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  //     const safeUrl: SafeUrl =
  //       this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  //     console.log('safeUrl', safeUrl);

  //     return safeUrl;
  //   }
  //   const safeUrl: SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //   return safeUrl;
  // }

  // loadCSSAndScript() {
  //   this.lazyloadService.loadCss(
  //     'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.7/dist/css/splide.min.css',
  //     () => {
  //       this.lazyloadService.loadScript(
  //         'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.7/dist/js/splide.min.js',
  //         () => {
  //           this.splideOnInit();
  //         }
  //       );
  //     }
  //   );
  // }

  // splideOnInit() {
  //   const splideElement = document.getElementById(this.compId);
  //   console.log('!!', (window as any).Splide);
  //   if (splideElement) {
  //     const splide = new (window as any).Splide(
  //       `#${this.compId}`,
  //       this.carouselOptions
  //     ).mount();
  //   } else {
  //     console.error(`[splide] Element with ID ${this.compId} not found.`);
  //   }
  // }

  // openViewMoreDialog(data: any) {
  //   // #docregion focus-restoration
  //   const dialogRef = this.dialog.open(ViewMoreContainerComponent, {
  //     restoreFocus: false,
  //   });

  //   dialogRef.componentInstance.data = data;
  //   dialogRef.afterClosed().subscribe(() => this.menuTrigger().focus());
  // }
}
