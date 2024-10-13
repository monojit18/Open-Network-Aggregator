import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socketIOClient: Socket;
  blockBppId = ['le-ps-bpp-network.onest.network', 'kahani-bpp.tekdinext.com'];
  private roomDataSubjects: { [roomId: string]: BehaviorSubject<any[]> } = {};

  constructor(private commonService: CommonService) {}

  initSocketClient(roomId: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socketQuery = {
        room: roomId,
      };

      this.socketIOClient = io(`${environment.SEEKER_RECEIVER_HTTP_HOST}`, {
        query: socketQuery,
        reconnection: true, // Enable reconnection
        reconnectionAttempts: 5, // Max reconnection attempts
        reconnectionDelay: 5000, // Delay between reconnections (5 seconds)
      });

      this.socketIOClient.on('connect', () => {
        this.prepareSocketClient(roomId);
        console.log(this.socketIOClient.id, 'socketData');
        resolve(this.socketIOClient); // Resolving the socket when connected
      });

      this.socketIOClient.on('connect_error', (err) => {
        console.error('Connection error:', err);
        reject(err); // Rejecting in case of connection error
      });

      // Optional: Handle reconnection attempts
      this.socketIOClient.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt: ${attemptNumber}`);
      });

      this.socketIOClient.on('reconnect', () => {
        console.log('Socket reconnected');
        this.prepareSocketClient(roomId);
      });
    });
  }

  prepareSocketClient(roomId: string) {
    const KConnectionEvent = 'connection';
    const KConnectedEvent = 'connected';
    const KEndConnectionEvent = 'end';
    const KDisconnectEvent = 'disconnect';
    const KRoomKey = 'room';
    const KOnSearchAction = 'on_search';
    const KOnSelectAction = 'on_select';
    const KOnInitAction = 'on_init';
    const KOnConfirmAction = 'on_confirm';
    const KOnStatusAction = 'on_status';
    const KOnWeatherAction = 'on_weather';
    const KOnLlmAction = 'on_llm';
    const KOnVideosAction = 'on_video';
    const KOnErrorAction = 'on_error';
    const KOnOndcAction = 'on_ondc';

    // Ensure to remove old listeners before adding new ones to avoid duplication
    this.socketIOClient.off(KConnectionEvent);
    this.socketIOClient.off(KConnectedEvent);
    this.socketIOClient.off(KOnLlmAction);
    this.socketIOClient.off(KOnSearchAction);
    this.socketIOClient.off(KOnSelectAction);
    this.socketIOClient.off(KOnInitAction);
    this.socketIOClient.off(KOnConfirmAction);
    this.socketIOClient.off(KOnStatusAction);
    this.socketIOClient.off(KOnWeatherAction);
    this.socketIOClient.off(KOnVideosAction);
    this.socketIOClient.off(KOnOndcAction);
    this.socketIOClient.off(KEndConnectionEvent);
    this.socketIOClient.off(KOnErrorAction);
    this.socketIOClient.off(KDisconnectEvent);

    // Now attach listeners again
    this.socketIOClient.on(KConnectionEvent, () => {
      console.log(this.socketIOClient.id);
    });

    this.socketIOClient.on(KConnectedEvent, (message) => {
      console.log(message);
    });

    this.socketIOClient.on(KOnLlmAction, (message) => {
      const messageId = message.context.message_id;
      let generatedData = {
        isUser: false,
        data: {
          userInput: null,
          generatedMessage: message,
        },
      };
      if (Object.keys(message.message).length) {
        if (message.message.provider) {
          this.commonService.updateHistory(
            message.message.provider.chat.histories
          );
        }
        this.commonService.addDataToMaster(roomId, messageId, generatedData);
      }
    });

    // Use once to ensure this event is handled only once
    this.socketIOClient.on(KOnSearchAction, (message) => {
      console.log(
        '!! KOnSearchAction event triggered',
        message.context.message_id
      );
      this.handleNonLlmActions(roomId, message, 'on_search');
    });

    this.socketIOClient.on(KOnSelectAction, (message) => {
      console.log(message);
      this.handleNonLlmActions(roomId, message, 'on_select');
    });

    this.socketIOClient.on(KOnInitAction, (message) => {
      console.log(message);
      // this.handleNonLlmActions(roomId, message, 'on_init');
    });

    this.socketIOClient.on(KOnConfirmAction, (message) => {
      console.log(message);
      // this.handleNonLlmActions(roomId, message, 'on_confirm');
    });

    this.socketIOClient.on(KOnStatusAction, (message) => {
      console.log(message);
      // this.handleNonLlmActions(roomId, message, 'on_status');
    });

    this.socketIOClient.on(KOnWeatherAction, (message) => {
      this.handleNonLlmActions(roomId, message, 'on_weather');
    });

    this.socketIOClient.on(KOnVideosAction, (message) => {
      console.log(message);
      this.handleNonLlmActions(roomId, message, 'on_videos');
    });

    this.socketIOClient.on(KOnOndcAction, (message) => {
      this.handleNonLlmActions(roomId, message, 'on_ondc');
    });

    this.socketIOClient.on(KEndConnectionEvent, (message) => {
      console.log(message);
    });

    this.socketIOClient.on(KOnErrorAction, (message) => {
      console.log(message);
      // this.handleNonLlmActions(roomId, message, 'on_error');
    });

    this.socketIOClient.on(KDisconnectEvent, () => {
      console.log('Socket disconnected');
      console.log(this.socketIOClient.connected);
    });
  }

  // Generic handler for non-LLM actions
  private handleNonLlmActions(
    roomId: string,
    message: any,
    actionType: string
  ) {
    const messageId = message.context.message_id;
    const bppId = message.context.bpp_id;
    let generatedData = {
      isUser: false,
      data: {
        userInput: null,
        generatedMessage: message,
      },
    };

    if (this.blockBppId.includes(bppId)) {
      console.log(`Skipping message from blocked bpp_id: ${bppId}`);
      return; // Exit the function without further processing
    }
    console.log(
      `!! ${Object.keys(message.message).length} non-LLM`,
      message.message
    );
    if (Object.keys(message.message).length) {
      this.commonService.clearHistory();
      console.log(`History cleared due to ${actionType}`);

      console.log(`!! ${actionType} response added to master`);
      this.commonService.addDataToMaster(roomId, messageId, generatedData);
    }
  }

  // Observable to retrieve room data
  getRoomDataObservable(roomId: string): Observable<any> {
    if (!this.roomDataSubjects[roomId]) {
      this.roomDataSubjects[roomId] = new BehaviorSubject<any[]>([]);
    }
    return this.roomDataSubjects[roomId].asObservable();
  }

  // Disconnect from the socket
  disconnect() {
    this.socketIOClient.disconnect();
  }
}
