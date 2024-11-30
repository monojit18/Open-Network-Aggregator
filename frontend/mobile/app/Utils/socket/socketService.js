import axios from 'axios';
import io from 'socket.io-client';

const EVENT_SERVER_HTTP_HOST =
  'https://seeker-receiver-801148443625.asia-southeast1.run.app';

class SocketService {
  constructor() {
    this.socket = null;
  }

  initSocketClient(roomId) {
    const socketQuery = {room: roomId};
    this.socket = io(EVENT_SERVER_HTTP_HOST, {
      query: socketQuery,
    });

    this.socket.on('connection', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connected', message => {
      console.log('Connected message:', message);
    });

    this.socket.on('on_search', message => {
      console.log('Search message:', message);
    });

    this.socket.on('on_select', message => {
      console.log('Select message:', message);
    });

    this.socket.on('on_init', message => {
      console.log('Init message:', message);
    });

    this.socket.on('on_confirm', message => {
      console.log('Confirm message:', message);
    });

    this.socket.on('on_status', message => {
      console.log('Status message:', message);
    });

    this.socket.on('end', message => {
      console.log('End message:', message);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  async initSocketServerConnection() {
    try {
      const response = await axios.post(`${EVENT_SERVER_HTTP_HOST}/init`);
      console.log('Server connection initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing server connection:', error);
      throw error;
    }
  }

  async initializeConnection(transactionId) {
    this.initSocketClient(transactionId);
    return this.initSocketServerConnection();
  }
}

export default new SocketService();
