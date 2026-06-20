const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Track active meeting rooms and their participants
const meetings = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ---- JOIN ROOM ----
    socket.on("join-room", ({ meetingId, role, userData }) => {
      if (!meetingId) return;

      // Leave any previous rooms (except the default socket room)
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.leave(room);
        }
      }

      // Join the meeting room
      socket.join(meetingId);
      socket.data.meetingId = meetingId;
      socket.data.role = role;
      socket.data.userData = userData;

      // Track participant in the meeting
      if (!meetings.has(meetingId)) {
        meetings.set(meetingId, new Map());
      }
      const participants = meetings.get(meetingId);
      participants.set(socket.id, {
        socketId: socket.id,
        role,
        userData: userData || {},
        joinedAt: new Date().toISOString(),
        isVideoOn: false,
        isAudioOn: false,
        isHandRaised: false,
      });

      console.log(`User joined room ${meetingId} as ${role}: ${socket.id}`);

      // Notify others in the room that this participant joined
      socket.to(meetingId).emit("participant-joined", {
        socketId: socket.id,
        role,
        userData: userData || {},
        participants: getParticipantsList(participants),
      });

      // Send the current participants list to the newly joined user
      socket.emit("room-participants", {
        participants: getParticipantsList(participants),
        yourSocketId: socket.id,
      });

      // If this is not the first participant, mark meeting as active
      if (participants.size >= 2) {
        io.to(meetingId).emit("meeting-active", {
          message: "Both participants have joined",
        });
      }
    });

    // ---- CHAT MESSAGE ----
    socket.on("send-message", ({ meetingId, message }) => {
      if (!meetingId || !message) return;
      // Broadcast the message to everyone in the room including sender
      io.to(meetingId).emit("receive-message", {
        ...message,
        socketId: socket.id,
        role: socket.data.role,
      });
    });

    // ---- CAMERA TOGGLE (dedicated event with user notification) ----
    socket.on("camera-toggle", ({ meetingId, isVideoOn }) => {
      if (!meetingId) return;
      const participants = meetings.get(meetingId);
      if (participants) {
        const participant = participants.get(socket.id);
        if (participant) {
          participant.isVideoOn = isVideoOn;
        }
      }
      // Broadcast to everyone except sender
      socket.to(meetingId).emit("participant-camera-toggle", {
        socketId: socket.id,
        role: socket.data.role,
        isVideoOn,
        userId: socket.data.role, // 'patient' or 'doctor'
      });
    });

    // ---- TYPING INDICATOR ----
    socket.on("typing", ({ meetingId, isTyping }) => {
      if (!meetingId) return;
      socket.to(meetingId).emit("user-typing", {
        socketId: socket.id,
        role: socket.data.role,
        isTyping,
      });
    });

    // ---- MEDIA STATE CHANGE ----
    socket.on("media-state-change", ({ meetingId, type, value }) => {
      if (!meetingId) return;
      const participants = meetings.get(meetingId);
      if (participants) {
        const participant = participants.get(socket.id);
        if (participant) {
          if (type === "video") participant.isVideoOn = value;
          if (type === "audio") participant.isAudioOn = value;
          if (type === "handRaise") participant.isHandRaised = value;
        }
      }
      socket.to(meetingId).emit("participant-media-change", {
        socketId: socket.id,
        role: socket.data.role,
        type,
        value,
      });
    });

    // ---- WEBRTC SIGNALING ----
    // Forward offer from caller (second participant) to the first participant
    socket.on("webrtc-offer", ({ meetingId, offer }) => {
      if (!meetingId) return;
      socket.to(meetingId).emit("webrtc-offer", { offer, from: socket.id });
    });

    // Forward answer back to the caller
    socket.on("webrtc-answer", ({ meetingId, answer }) => {
      if (!meetingId) return;
      socket.to(meetingId).emit("webrtc-answer", { answer, from: socket.id });
    });

    // Forward ICE candidates between peers
    socket.on("webrtc-ice-candidate", ({ meetingId, candidate }) => {
      if (!meetingId) return;
      socket.to(meetingId).emit("webrtc-ice-candidate", { candidate, from: socket.id });
    });

    // ---- FILE SHARED ----
    socket.on("file-shared", ({ meetingId, fileData }) => {
      if (!meetingId || !fileData) return;
      socket.to(meetingId).emit("receive-file", {
        ...fileData,
        uploadedBy: socket.data.role,
        socketId: socket.id,
      });
    });

    // ---- DISCONNECT ----
    socket.on("disconnect", () => {
      const { meetingId, role } = socket.data;
      console.log(`Socket disconnected: ${socket.id} from room ${meetingId}`);

      if (meetingId) {
        const participants = meetings.get(meetingId);
        if (participants) {
          participants.delete(socket.id);

          socket.to(meetingId).emit("participant-left", {
            socketId: socket.id,
            role,
            userData: socket.data.userData,
            participants: getParticipantsList(participants),
          });

          // Clean up empty meetings
          if (participants.size === 0) {
            meetings.delete(meetingId);
            console.log(`Meeting room ${meetingId} deleted - no participants`);
          }
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

/**
 * Helper to get a serializable list of participants
 */
function getParticipantsList(participantsMap) {
  const list = [];
  for (const [socketId, data] of participantsMap) {
    list.push({
      socketId,
      role: data.role,
      userData: data.userData,
      joinedAt: data.joinedAt,
      isVideoOn: data.isVideoOn,
      isAudioOn: data.isAudioOn,
      isHandRaised: data.isHandRaised,
    });
  }
  return list;
}