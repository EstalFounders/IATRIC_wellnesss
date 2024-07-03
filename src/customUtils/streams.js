
import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

const getToken = async (userId) => {
  try {
    const response = await fetch('/api/lib/generateStreamToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }

    const { chatToken, videoToken } = await response.json();
    return { chatToken, videoToken };
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export { getToken };
