import { io } from "socket.io-client";

let socket = null;

/**
 * Get or create a socket connection
 * Uses a singleton pattern so only one connection exists
 */
export const getSocket = () => {
  if (!socket) {
    const serverUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'; // Fallback to local server if env variable is not set

    socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }
  return socket;
};

/**
 * Disconnect and reset the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;