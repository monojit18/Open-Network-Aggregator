import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonService } from '../../services/common.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { WeatherComponent } from '../../providers/weather/weather.component';
import { VideosComponent } from '../../providers/videos/videos.component';
import { AgriComponent } from '../../providers/agri/agri.component';
import { TranslateModule } from '@ngx-translate/core';
import { GenTranslatePipe } from '../../services/pipes/gen-translate.pipe';
import { LlmComponent } from '../llm/llm.component';
import { FeedbackComponent } from '../../helpers/feedback/feedback.component';
import { ItemsContainerComponent } from '../../helpers/items-container/items-container.component';
import { OndcComponent } from '../../providers/ondc/ondc.component';
import { OnestComponent } from '../../providers/onest/onest.component';
import { DriverComponent } from '../../providers/driver/driver.component';
import { OnestSelectComponent } from '../../providers/onest/onest-select/onest-select.component';

@Component({
  selector: 'app-generative-content',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ItemsContainerComponent,
    EmptyStateComponent,
    WeatherComponent,
    VideosComponent,
    OndcComponent,
    AgriComponent,
    TranslateModule,
    GenTranslatePipe,
    LlmComponent,
    OnestComponent,
    FeedbackComponent,
    DriverComponent,
    OnestSelectComponent,
  ],
  templateUrl: './generative-content.component.html',
  styleUrl: './generative-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerativeContentComponent implements OnInit {
  @Input() transactionId: any;
  generativeData: any = [];
  isLoading: boolean = false;
  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.generativeData = this.commonService.getDataFromMaster(
      this.transactionId
    );
    this.commonService.masterDataEmitter.subscribe(() => {
      this.generativeData =
        this.commonService.getDataFromMaster(this.transactionId) || [];

      this.isLoading =
        this.generativeData[
          Object.keys(this.generativeData)[
            Object.keys(this.generativeData).length - 1
          ]
        ].at(-1).isUser;

      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 12000);
      let lastMessage =
        this.generativeData[
          Object.keys(this.generativeData)[
            Object.keys(this.generativeData).length - 1
          ]
        ].at(-1);
      console.log('!! lastMessage', lastMessage);
      if (
        lastMessage &&
        lastMessage?.data?.generatedMessage &&
        lastMessage?.data?.generatedMessage?.context?.action === 'on_select'
      ) {
        this.scrollToBottom();
      } else {
        this.scrollToLastMessage();
      }

      this.cdr.detectChanges();
    });
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        '.scroll-container'
      ) as HTMLElement;
      if (scrollContainer) {
        console.log('!! scrolls', scrollContainer.scrollHeight);

        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight - 300,
          behavior: 'smooth',
        });
      }
    }, 300);
  }
  scrollToLastMessage() {
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        '.scroll-container'
      ) as HTMLElement;
      const userMessages = scrollContainer.querySelectorAll('.user-message');

      if (userMessages.length > 0) {
        const lastUserMessage = userMessages[
          userMessages.length - 1
        ] as HTMLElement;
        const offset = 100;

        if (lastUserMessage) {
          // Get the position of the last user message and scroll to it with an offset
          const scrollPosition = lastUserMessage.offsetTop - offset;
          scrollContainer.scrollTo({
            top: scrollPosition,
            behavior: 'smooth',
          });
        }
      }
    }, 500);
  }
  readContentAloud(contentSection: HTMLDivElement) {
    const textToRead = contentSection.innerText; // Extract the text without HTML tags
    const speech = new SpeechSynthesisUtterance(textToRead); // Create a speech instance
    speech.lang = 'en-US'; // Set the language
    window.speechSynthesis.speak(speech); // Use the Web Speech API to speak the content
  }
}
