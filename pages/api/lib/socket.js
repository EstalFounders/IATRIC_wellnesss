import { Server } from "socket.io";

const rooms = {};

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

    // const emailToSocketIdMap = new Map();
    // const socketidToEmailMap = new Map();

    io.on("connection", (socket) => {
      console.log(`Socket Connected: ${socket.id}`);
      socket.on("room:join", ({ meetingId, userType }) => {
        // const { roomId } = data;
        console.log(`Joining room: ${meetingId}`);
        if (!rooms[meetingId]) {
          rooms[meetingId] = { patients: [], doctors: [] };
        }

        if (userType === "doctor") {
          rooms[meetingId].doctors.push(socket.id);
        } else {
          rooms[meetingId].patients.push(socket.id);
        }
        socket.join(meetingId);

        const otherUsers = Array.from(
          io.sockets.adapter.rooms.get(meetingId) || []
        ).filter((id) => id !== socket.id);
        if (otherUsers.length > 0) {
        io.to(socket.id).emit("user:joined", { id: otherUsers[0] });
        }

        socket.emit("room:currentState", rooms[meetingId]);
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
        socket.broadcast.emit("stream-update", { socketId, type, enabled });
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const meetingId in rooms) {
          const room = rooms[meetingId];
          room.patients = room.patients.filter((id) => id !== socket.id);
          room.doctors = room.doctors.filter((id) => id !== socket.id);

          // Notify other users in the room about the user leaving
          socket.to(meetingId).emit("user:left", { id: socket.id });

          if (room.patients.length === 0 && room.doctors.length === 0) {
            delete rooms[meetingId];
          }
        }
      });
    });
  }
  res.end();
};

export default SocketHandler;
