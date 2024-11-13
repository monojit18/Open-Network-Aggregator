/* eslint-disable prettier/prettier */
export const L1Adapter = async (searchText, messageId) => {
  // API endpoint
  const url =
    'https://master-agent-801148443625.asia-southeast1.run.app/search';
  console.log('request sent to L1 adapter: ', messageId, ' ', searchText);
  const payload = {
    transactionId: '8b4e8aea-91d3-42d7-aee9-00be34bab5ac',
    messageId: messageId,
    text: searchText,
  };
  console.log('payload  => ', JSON.stringify(payload));
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const jsonResponse = await response.json();
    console.log('Response data:', JSON.stringify(jsonResponse));

    // Log response metadata
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries()),
    );

    return jsonResponse?.results[0] ?? jsonResponse?.results; // Return the parsed JSON data instead of the response object
  } catch (error) {
    throw error;
  }
};

export const selectCourse = async () => {
  // API endpoint
  const url = 'https://master-middleware-4encm3loxa-as.a.run.app/select';
  const payload = {
    context: {
      action: 'on_search',
      domain: 'onest:learning-experiences',
      transaction_id: '7a2884f5-6bc6-4e7b-ae84-16b39211156d',
      message_id: 'b813425b-748a-4890-8bb7-557b93bc8339',
      version: '1.1.0',
      bap_id: 'seeker-dev.gcpwkshpdev.com',
      bap_uri: 'https://seeker-dev.gcpwkshpdev.com/bap',
      bpp_id: 'sandbox.onest.network/adaptor-bpp/smartlab',
      bpp_uri: 'https://sandbox.onest.network/adaptor-bpp/smartlab/bpp',
      ttl: 'PT10M',
    },
    message: {
      order: {
        provider: {
          id: 'PtAgriLearning',
        },
        items: [
          {
            id: '308',
          },
        ],
      },
    },
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
    throw error;
  }
};
