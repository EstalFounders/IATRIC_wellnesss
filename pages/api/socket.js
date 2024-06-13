import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      cors: { 
        origin: "*",
      },
    });
    res.socket.server.io = io;

    const emailToSocketIdMap = new Map();
    const socketidToEmailMap = new Map();

    io.on("connection", (socket) => {
      console.log(`Socket Connected: ${socket.id}`);
      socket.on("room:join", (data) => {
        const { roomId } = data;
        console.log(`Joining room: ${roomId}`);
        socket.join(roomId);

        const otherUsers = Array.from(
          io.sockets.adapter.rooms.get(roomId) || []
        ).filter((id) => id !== socket.id);
        if (otherUsers.length > 0) {
          io.to(socket.id).emit("user:joined", { id: otherUsers[0] });
        }
      });

      socket.on("user:call", ({ to, offer }) => {
        console.log("Received user:call event");
        console.log("Offer:", offer);
        console.log(`User call from ${socket.id} to ${to}`);
        io.to(to).emit("incoming:call", { from: socket.id, offer });
      });

      socket.on("call:accepted", ({ to, answer }) => {
        console.log(`Call accepted by ${socket.id} to ${to}`, " ", answer);
        io.to(to).emit("call:accepted", { from: socket.id, answer });
      });

      socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log(`Negotiation needed from ${socket.id} to ${to}`);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });

      socket.on("peer:nego:done", ({ to, answer }) => {
        console.log(`Negotiation done from ${socket.id} to ${to}`);
        io.to(to).emit("peer:nego:final", { from: socket.id, answer });
      });

      socket.on("stream-update", ({ socketId, type, enabled }) => {
        console.log(
          `Stream update from ${socketId}: ${type} is now ${enabled}`
        );

        // Broadcast the stream update to other users in the room
        socket.broadcast.emit("stream-update", {socketId, type, enabled})
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        const email = socketidToEmailMap.get(socket.id);
        if (email) {
          emailToSocketIdMap.delete(email);
          socketidToEmailMap.delete(socket.id);
        }
      });
    });
  }
  res.end();
  res.status(200).json({ message: 'Socket connection established' });
};

export default SocketHandler;
