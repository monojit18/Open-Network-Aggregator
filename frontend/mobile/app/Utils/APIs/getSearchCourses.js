import {L1Adapter} from './L1Adapter';
import axios from 'axios';
import eventEmitter from '../eventEmitter';
import io from 'socket.io-client';
import uuid from 'react-native-uuid';

const EVENT_SERVER_HTTP_HOST =
  'https://seeker-receiver-4encm3loxa-as.a.run.app';
const MASTER_AGENT_URL = 'https://master-agent-4encm3loxa-as.a.run.app/search';
const transactionId = uuid.v4();

class SocketService {
  constructor() {
    this.socket = null;
  }

  async initializeSocket() {
    return new Promise((resolve, reject) => {
      console.log('Initializing socket...');
      if (!this.socket) {
        axios
          .post(`${EVENT_SERVER_HTTP_HOST}/init`)
          .then(() => {
            this.socket = io(EVENT_SERVER_HTTP_HOST, {
              transports: ['websocket'],
              query: {room: transactionId},
            });

            this.setupSocketListeners();

            this.socket.on('connect', () => {
              console.log('Connected to socket server');
              resolve(this.socket);
            });
          })
          .catch(error => {
            console.error('Error initializing room:', error);
            reject(error);
          });
      } else {
        console.log('Socket already initialized');
        resolve(this.socket);
      }
    });
  }

  setupSocketListeners() {
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', error => {
      console.error('Socket error:', error);
      eventEmitter.emit('socketError', error);
    });

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
      eventEmitter.emit('socketConnectionError', error);
    });
  }

  filterUniqueVideos(videos) {
    const uniqueMap = new Map();
    videos.forEach(video => {
      if (!uniqueMap.has(video.videoId || video.id)) {
        uniqueMap.set(video.videoId || video.id, video);
      }
    });
    return Array.from(uniqueMap.values());
  }
  async fetchData(searchText, navigation, socketMessage) {
    const messageId = uuid.v4();

    try {
      await this.initializeSocket();

      return new Promise((resolve, reject) => {
        let isResolved = false;
        let timeoutId;
        let hasReceivedData = false;

        const eventHandler = data => {
          console.log('Received data:', data);
          if (data === 'Event stream started') {
            console.log('Event stream started');
          } else if (data === 'Event stream ended') {
            this.socket.off(`message_${messageId}`, eventHandler);
            clearTimeout(timeoutId);
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
          } else {
            try {
              const parsedData =
                typeof data === 'string' ? JSON.parse(data) : data;

              // Filter unique videos if the data contains video information
              if (
                parsedData.message &&
                parsedData.message.provider &&
                parsedData.message.provider.videos
              ) {
                parsedData.message.provider.videos = this.filterUniqueVideos(
                  parsedData.message.provider.videos,
                );
              }

              hasReceivedData = true;
              eventEmitter.emit('newData', parsedData.message);
            } catch (error) {
              console.error('Error processing data:', error);
              eventEmitter.emit('dataProcessingError', {error, rawData: data});
            }
          }
        };

        this.socket.on(`on_search`, eventHandler);
        this.socket.on(`search`, eventHandler);
        this.socket.on(`on_video`, eventHandler);
        this.sendSearchRequest(searchText, messageId);
        this.handleL1Adapter(searchText, messageId, navigation, socketMessage);

        // Set up the 60-second timer
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            this.socket.off(`message_${messageId}`, eventHandler);
            if (!hasReceivedData) {
              console.log(
                'Response timeout. No data received. Sending empty response.',
              );
              eventEmitter.emit('newData', {}); // Emit an empty response only if no data was received
            } else {
              console.log(
                'Response timeout, but data was received. Not sending empty response.',
              );
            }
            resolve();
          }
        }, 600000);
      });
    } catch (error) {
      console.error('Error in fetchData:', error);
      eventEmitter.emit('fetchDataError', error);
      throw error;
    }
  }

  async sendSearchRequest(searchText, messageId) {
    try {
      const response = await axios.post(
        MASTER_AGENT_URL,
        {
          transactionId: transactionId,
          messageId: messageId,
          text: searchText,
        },
        {
          headers: {'Content-Type': 'application/json'},
        },
      );
      console.log('Search request sent successfully:', response.data);
    } catch (error) {
      eventEmitter.emit('searchRequestError', error);
    }
  }

  async handleL1Adapter(searchText, messageId, navigation) {
    try {
      const response = await L1Adapter(searchText, messageId);
      if (response?.context?.domain === 'integrator:video') {
        this.socket.emit('on_video', {
          context: {
            transaction_id: transactionId,
            message_id: response?.context?.message_id,
            version: '1.1.0',
          },
          message: {
            intent: {
              item: {
                descriptor: {
                  name: searchText,
                },
              },
            },
          },
        });
      } else {
        let params = {
          context: {
            transaction_id: transactionId,
            message_id: response?.context?.message_id,
            version: '1.1.0',
          },
          message: {
            intent: {
              item: {
                descriptor: {
                  name: searchText,
                },
              },
            },
          },
        };
        this.socket.emit(response?.context?.action || 'on_search', params);
      }

      if (response?.status === 501) {
        console.log('Navigating to RetailDomain');
        navigation.navigate('RetailDomain');
      }
    } catch (error) {
      eventEmitter.emit('l1AdapterError', JSON.stringify(error));
    }
  }

  closeSocketConnection() {
    if (this.socket) {
      console.log('Closing socket connection');
      this.socket.close();
      this.socket = null;
    } else {
      console.log('No socket connection to close');
    }
  }
}

const socketService = new SocketService();

export const fetchData = (searchText, navigation, socketMessage) =>
  socketService.fetchData(searchText, navigation, socketMessage);

export const closeSocketConnection = () =>
  socketService.closeSocketConnection();
