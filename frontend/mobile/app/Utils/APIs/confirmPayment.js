import EventSource from 'react-native-sse';
import uuid from 'react-native-uuid';
export const AdapterConfirm = async () => {
  // API endpoint
  const url = 'https://master-middleware-4encm3loxa-as.a.run.app/confirm';
  const payload = {
    // context: {
    //   action: 'on_search',
    //   domain: 'onest:learning-experiences',
    //   transaction_id: '7a2884f5-6bc6-4e7b-ae84-16b39211156d',
    //   message_id: 'b813425b-748a-4890-8bb7-557b93bc8339',
    //   version: '1.1.0',
    //   bap_id: 'seeker-dev.gcpwkshpdev.com',
    //   bap_uri: 'https://seeker-dev.gcpwkshpdev.com/bap',
    //   bpp_id: 'sandbox.onest.network/adaptor-bpp/smartlab',
    //   bpp_uri: 'https://sandbox.onest.network/adaptor-bpp/smartlab/bpp',
    //   ttl: 'PT10M',
    // },
    // message: {
    //   order: {
    //     provider: {
    //       id: 'PtAgriLearning',
    //     },
    //     items: [
    //       {
    //         id: '308',
    //       },
    //     ],
    //   },
    // },
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const jsonResponse = await response.json();
    console.log('Response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const confirmPayment = async searchText => {
  const messageId = uuid.v4();

  console.log('fetchData triggered: ', messageId, ' ', searchText);
  try {
    const eventSource = await EventSource(
      `https://onest-bap.skillsetu.co/api/v1/onest/course/wbel/events?message_id=${messageId}`,
    );

    eventSource.addEventListener('message', event => {
      //   console.log('eventdata: ', event.data);
      const dataString = event.data.trim();
      console.log('Raw event data:', dataString); // Debug log
      // if (dataString === 'Event stream started') {
      //   console.log('Event stream started');
      // } else if (dataString === 'Event stream ended') {
      //   console.log('Event stream ended');
      //   eventSource.close();
      // } else {
      //   try {
      //     const data = JSON.parse(dataString);
      //     console.log('Real-time data:', data.message);
      //     eventEmitter.emit('newData', data.message);
      //   } catch (error) {
      //     console.error('Error parsing JSON:', error);
      //     eventEmitter.emit('error', error);
      //   }
      // }
    });

    eventSource.addEventListener('error', error => {
      console.error('Error fetching data:', error);
      // eventEmitter.emit('error', error);
      eventSource.close();
    });

    // Optional: Handle open and close events if needed
    eventSource.addEventListener('open', () => {
      console.log('Connected to SSE stream');
    });

    eventSource.addEventListener('close', () => {
      console.log('SSE stream closed');
    });

    // await new Promise(resolve => setTimeout(resolve, 20000));
    const response = await AdapterConfirm(searchText, messageId);
    console.log('Search results: ', response);
    // Ensure to close the EventSource properly when done
    return () => {
      eventSource.close();
    };
  } catch (error) {
    console.error('Error setting up EventSource:', error);
    eventEmitter.emit('error', error);
  }
};
