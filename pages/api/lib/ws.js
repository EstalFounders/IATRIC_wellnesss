// pages/api/ws.js

import { Server } from "socket.io-client";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("A user connected");

      // Handle joining a room
      socket.on("joinRoom", (meetingId) => {
        socket.join(meetingId);
        console.log(`User joined room ${meetingId}`);

        // Broadcast to other users in the room
        socket.to(meetingId).emit("userJoined", socket.id);
      });

      // Handle leaving a room
      socket.on("leaveRoom", (meetingId) => {
        socket.leave(meetingId);
        console.log(`User left room ${meetingId}`);

        // Broadcast to other users in the room
        socket.to(meetingId).emit("userLeft", socket.id);
      });

      // Handle signaling
      socket.on("signal", (data) => {
        // Broadcast signal to other users in the room
        socket.to(data.meetingId).emit("signal", {
          signal: data.signal,
          callerId: socket.id,
        });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
