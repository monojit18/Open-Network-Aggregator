import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  OnDestroy,
  OnInit,
  QueryList,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { GenerativeContentComponent } from '../generative/generative-content/generative-content.component';
import { GenerativeInteractionComponent } from '../generative/generative-interaction/generative-interaction.component';
import { EmptyStateComponent } from '../generative/empty-state/empty-state.component';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.service';
import { CommonService } from '../services/common.service';
import { LoadingComponent } from '../helpers/loading/loading.component';
@Component({
  selector: 'app-core',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidenavComponent,
    MatSidenavModule,
    GenerativeContentComponent,
    GenerativeInteractionComponent,
    GenerativeInteractionComponent,
    GenerativeContentComponent,
    EmptyStateComponent,

    LoadingComponent,
  ],
  templateUrl: './core.component.html',
  styleUrl: './core.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreComponent implements OnInit, OnDestroy {
  hasContent: boolean = false;
  @ContentChildren(GenerativeContentComponent)
  generativeContentComponents!: QueryList<GenerativeContentComponent>;
  transactionId: string = '27367140-b61f-49e0-a8e6-cdbe1015cdi';
  generativeData: any = {};
  isLoading: boolean = false;
  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService
  ) {}
  ngOnInit() {
    this.transactionId = this.commonService.generateUUID();
    // this.loadScript();
    // this.loadCSS();
    this.connectToWS();
    this.commonService.masterDataEmitter.subscribe(() => {
      this.generativeData =
        this.commonService.getDataFromMaster(this.transactionId) || {};
      console.log('!! content core', this.generativeData);

      let generatedMaster = this.commonService.getDataFromMaster(
        this.transactionId
      );
      this.isLoading =
        generatedMaster[
          Object.keys(generatedMaster)[Object.keys(generatedMaster).length - 1]
        ].at(-1).isUser;
      setTimeout(() => {
        this.isLoading = false;
      }, 12000);
      this.cdr.detectChanges();
    });
    this.commonService.changeTransactionIdEmitter.subscribe(() => {
      console.log('transaction called');
      this.socketService.disconnect();
      this.transactionId = this.commonService.generateUUID();
      this.connectToWS();
    });
  }
  emptyStateOnPromptHandler(event: any) {
    console.log(event);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  generateHandler(data: any) {
    let id = (Math.random() + 1).toString(36).substring(2);
    const generatedContext = { ...data, id };
  }

  scrollToBottom(): void {}
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  connectToWS() {
    try {
      this.socketService.initSocketClient(this.transactionId);
    } catch (error) {
      console.log(error, 'error');
    }
  }
}
