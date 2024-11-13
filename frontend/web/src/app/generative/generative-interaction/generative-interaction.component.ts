import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { ApiClientService } from '../../services/api-client.service';
import { SocketService } from '../../services/socket.service';
import { CommonService } from '../../services/common.service';
import { FormsModule } from '@angular/forms';
// import { ondcBuyMock, ondcSellMock } from './mockData';

import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { driverJobMock, mandiMock, ondcSellMock } from './mockData';
interface contextData {
  userInput: any;
  generatedMessage: any;
}
interface GeneratedData {
  isUser: boolean;
  data: contextData;
}

@Component({
  selector: 'app-generative-interaction',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatTooltip],
  templateUrl: './generative-interaction.component.html',
  styleUrl: './generative-interaction.component.scss',
})
export class GenerativeInteractionComponent implements OnInit {
  @ViewChild('textareaElement') textareaElement!: ElementRef;
  @Output() onGenerate = new EventEmitter();
  @Input() transactionId: string;
  transcript: string = ''; // This will hold the speech recognition result
  recognition: any;
  isListening: boolean = false;
  generatedData: GeneratedData = {
    isUser: false,
    data: {
      userInput: null,
      generatedMessage: null,
    },
  };
  apiService = inject(ApiClientService);
  socketService = inject(SocketService);
  translate = inject(TranslateService);
  inputValue: string = '';
  searchData: any;
  messageId: string = '';
  constructor(
    private commonService: CommonService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    let sLang: string = 'en-US';
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      switch (event.lang) {
        case 'en':
          sLang = 'en-US';
          break;
        case 'hi':
          sLang = 'hi-IN';
          break;
        case 'bn':
          sLang = 'bn-IN';
          break;
        case 'te':
          sLang = 'te-IN';
          break;
        case 'kn':
          sLang = 'kn-IN';
          break;
        case 'gu':
          sLang = 'gu-IN';
          break;
        case 'pa':
          sLang = 'pa-IN';
          break;

        default:
          sLang = 'en-US';
          break;
      }

      console.log('lang', sLang);

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = sLang;
        this.recognition.interimResults = true; // Enable interim results
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.ngZone.run(() => {
            console.log('Speech recognition service started');
            this.isListening = true; // Indicate that it’s listening
            navigator.vibrate(200);
            this.cdr.detectChanges();
          });
        };

        this.recognition.onresult = (event: any) => {
          this.ngZone.run(() => {
            let interimTranscript = ''; // Capture interim results
            for (let i = event.resultIndex; i < event.results.length; i++) {
              interimTranscript += event.results[i][0].transcript;
            }

            this.inputValue = interimTranscript; // Update inputValue with partial results
            this.cdr.detectChanges();
          });
        };

        this.recognition.onend = () => {
          this.ngZone.run(() => {
            console.log('Speech recognition service ended');
            this.isListening = false;
            this.cdr.detectChanges();
          });
        };

        this.recognition.onspeechend = () => {
          this.recognition.stop();
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error detected:', event.error);
        };
      } else {
        console.error('Web Speech API is not supported in this browser.');
      }
    });
  }

  startListening(): void {
    console.log('!!! init');
    if (this.recognition) {
      this.recognition.start(); // Start speech recognition
    } else {
      alert('!!! Sorry, your browser does not support speech recognition.');
    }
  }

  ngOnInit(): void {
    this.messageId = this.generateMessageId();
    // this.apiService.onMandiSearch().subscribe((data) => {
    //   console.log('!! Mandi data', data);
    // });
  }
  generateMessageId() {
    let tranId = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 1; i <= 15; i++) {
      let char = Math.floor(Math.random() * str.length + 1);

      tranId += str.charAt(char);
    }

    return tranId;
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const textareaValue = this.textareaElement.nativeElement.value;
      event.preventDefault();
      if (textareaValue) {
        this.makeCall(textareaValue);
      }
    }
  }

  handleButtonClick() {
    if (this.inputValue) {
      this.makeCall(this.inputValue);
    }
  }

  makeCall(message: any) {
    console.log('!! message', message);
    if (!message) {
      return;
    }
    this.messageId = this.commonService.generateUUID();
    this.generatedData.isUser = true;
    this.generatedData.data.userInput = message;
    this.generatedData.data.generatedMessage = null;
    this.commonService.addDataToMaster(
      this.transactionId,
      this.messageId,
      this.generatedData
    );
    if (
      message.toLowerCase().includes('driver') ||
      message.toLowerCase().includes('driving') ||
      message.includes('चालक') ||
      message.includes('ड्राइवर')
    ) {
      setTimeout(() => {
        let generatedData = {
          isUser: false,
          data: {
            userInput: null,
            generatedMessage: driverJobMock,
          },
        };

        this.commonService.addDataToMaster(
          this.transactionId,
          this.messageId,
          generatedData
        );
      }, 2000);
      this.textareaElement.nativeElement.value = '';
      this.inputValue = '';
      return;
    }

    // if (
    //   message.toLowerCase().includes('sell') ||
    //   message.includes('बेच देना') ||
    //   message.includes('विक्रय करना') ||
    //   message.includes('बेच') ||
    //   message.includes('बेचना')
    // ) {
    //   setTimeout(() => {
    //     let generatedData = {
    //       isUser: false,
    //       data: {
    //         userInput: null,
    //         generatedMessage: ondcSellMock,
    //       },
    //     };

    //     this.commonService.addDataToMaster(
    //       this.transactionId,
    //       this.messageId,
    //       generatedData
    //     );
    //   }, 2000);
    //   this.textareaElement.nativeElement.value = '';
    //   this.inputValue = '';
    //   return;
    // }

    if (
      (message.toLowerCase().includes('mandi') || message.includes('मंडी')) &&
      (message.toLowerCase().includes('rice') ||
        message.includes('चावल') ||
        message.includes('राइस'))
    ) {
      // this.apiService.onMandiSearch().subscribe((data) => {
      setTimeout(() => {
        let res: any = {
          message: null,
          context: {
            domain: null,
          },
        };
        res['message'] = mandiMock;
        res['context']['domain'] = 'Agri';
        let generatedData = {
          isUser: false,
          data: {
            userInput: null,
            generatedMessage: res,
          },
        };
        this.commonService.addDataToMaster(
          this.transactionId,
          this.messageId,
          generatedData
        );
      }, 2000);
      // });

      this.textareaElement.nativeElement.value = '';
      this.inputValue = '';
      return;
    }
    const histories = this.commonService.history || [];

    const payload = histories.length
      ? { histories, text: this.translate.instant(message) }
      : { text: this.translate.instant(message) };

    this.apiService
      .onSearch(payload, this.messageId, this.transactionId)
      .subscribe((data) => {
        console.log('data', data);
      });
    this.textareaElement.nativeElement.value = '';
    this.inputValue = '';
  }
  clear() {
    this.commonService.clearMaster();

    this.textareaElement.nativeElement.value = '';
    this.inputValue = '';
  }
}
