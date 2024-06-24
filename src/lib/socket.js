import { io } from 'socket.io-client';
import { production_url } from '../constant';

const initializeSocket = async () => {
  try {
    // Ensure the API route is called first
    await fetch('/api/lib/socket');

    // Initialize the socket connection
    const socket = io(production_url); // Your Next.js server address

    // Return a promise that resolves when the socket is connected
    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('Socket connected:', socket);
        resolve(socket);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    throw error;
  }
};

// Export the initializeSocket function
export default initializeSocket;
