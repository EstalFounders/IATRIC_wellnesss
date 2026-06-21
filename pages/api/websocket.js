/**
 * WebSocket API Route Handler
 *
 * This route processes WebSocket messages forwarded by API Gateway.
 * API Gateway sends POST requests here with the message body containing
 * action, connectionId, meetingId, domainName, stage, and event data.
 *
 * Routes:
 * - POST /api/websocket?action=connect   — Save connection to DynamoDB
 * - POST /api/websocket?action=disconnect — Remove connection from DynamoDB
 * - POST /api/websocket                  — Process message actions
 */

import { getApiGateway, saveConnection, removeConnection, getConnectionsInRoom, broadcastToRoom, sendToConnection, getParticipantsList, updateConnectionMeta } from "../../lib/websocket";

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, connectionId, meetingId, role, userData, domainName, stage, ...eventData } = req.body;

  if (!connectionId) {
    return res.status(400).json({ error: "Missing connectionId" });
  }

  const apiGateway = domainName && stage ? getApiGateway(domainName, stage) : null;

  try {
    // ---- CONNECT: store the connection in DynamoDB ----
    if (action === "connect") {
      if (!meetingId || !role) {
        return res.status(400).json({ error: "Missing meetingId or role" });
      }
      const userName = userData?.name || (role === "doctor" ? "Doctor" : "Patient");
      await saveConnection(connectionId, meetingId, role, { name: userName, role });
      console.log(`User connected: ${connectionId} to meeting ${meetingId} as ${role}`);

      // Get updated participant list and notify others
      const connections = await getConnectionsInRoom(meetingId);
      const participants = getParticipantsList(connections);

      // Notify others that this participant joined
      if (apiGateway) {
        await broadcastToRoom(apiGateway, meetingId, "participant-joined", {
          socketId: connectionId,
          role,
          userData: { name: userName, role },
          participants,
        }, connectionId);

        // Send the current participant list to the newly connected user
        await sendToConnection(apiGateway, connectionId, "room-participants", {
          participants,
          yourSocketId: connectionId,
        });

        // If 2+ participants, mark meeting as active
        if (participants.length >= 2) {
          await broadcastToRoom(apiGateway, meetingId, "meeting-active", {
            message: "Both participants have joined",
          });
        }
      }

      return res.status(200).json({ success: true });
    }

    // ---- DISCONNECT: remove connection from DynamoDB ----
    if (action === "disconnect") {
      // Fetch connection info before removing
      const existingConnections = await getConnectionsInRoom(meetingId || "");
      const myConn = existingConnections.find((c) => c.connectionId === connectionId);
      const myRole = myConn?.role || role;
      const myUserData = myConn?.userData || userData || {};

      await removeConnection(connectionId);

      if (meetingId && apiGateway) {
        const remainingConnections = await getConnectionsInRoom(meetingId);
        const participants = getParticipantsList(remainingConnections);

        await broadcastToRoom(apiGateway, meetingId, "participant-left", {
          socketId: connectionId,
          role: myRole,
          userData: myUserData,
          participants,
        });
      }

      console.log(`User disconnected: ${connectionId} from meeting ${meetingId}`);
      return res.status(200).json({ success: true });
    }

    // ---- All other actions require meetingId ----
    if (!meetingId) {
      return res.status(400).json({ error: "Missing meetingId" });
    }
    if (!apiGateway) {
      return res.status(400).json({ error: "Missing domainName/stage" });
    }

    // ---- CHAT MESSAGE ----
    if (action === "send-message") {
      const { message } = eventData;
      if (!message) return res.status(400).json({ error: "Missing message" });

      await broadcastToRoom(apiGateway, meetingId, "receive-message", {
        ...message,
        socketId: connectionId,
        role,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- CAMERA TOGGLE ----
    if (action === "camera-toggle") {
      const { isVideoOn } = eventData;
      await updateConnectionMeta(connectionId, { isVideoOn: !!isVideoOn });

      await broadcastToRoom(apiGateway, meetingId, "participant-camera-toggle", {
        socketId: connectionId,
        role,
        isVideoOn: !!isVideoOn,
        userId: role,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- TYPING INDICATOR ----
    if (action === "typing") {
      const { isTyping } = eventData;
      await broadcastToRoom(apiGateway, meetingId, "user-typing", {
        socketId: connectionId,
        role,
        isTyping: !!isTyping,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- MEDIA STATE CHANGE ----
    if (action === "media-state-change") {
      const { type, value } = eventData;

      // Update local state in DynamoDB
      if (type === "video") await updateConnectionMeta(connectionId, { isVideoOn: !!value });
      if (type === "audio") await updateConnectionMeta(connectionId, { isAudioOn: !!value });
      if (type === "handRaise") await updateConnectionMeta(connectionId, { isHandRaised: !!value });

      await broadcastToRoom(apiGateway, meetingId, "participant-media-change", {
        socketId: connectionId,
        role,
        type,
        value,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- WEBRTC SIGNALING: offer ----
    if (action === "webrtc-offer") {
      const { offer } = eventData;
      if (!offer) return res.status(400).json({ error: "Missing offer" });

      await broadcastToRoom(apiGateway, meetingId, "webrtc-offer", {
        offer,
        from: connectionId,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- WEBRTC SIGNALING: answer ----
    if (action === "webrtc-answer") {
      const { answer } = eventData;
      if (!answer) return res.status(400).json({ error: "Missing answer" });

      await broadcastToRoom(apiGateway, meetingId, "webrtc-answer", {
        answer,
        from: connectionId,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- WEBRTC SIGNALING: ICE candidate ----
    if (action === "webrtc-ice-candidate") {
      const { candidate } = eventData;
      if (!candidate) return res.status(400).json({ error: "Missing candidate" });

      await broadcastToRoom(apiGateway, meetingId, "webrtc-ice-candidate", {
        candidate,
        from: connectionId,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- FILE SHARED ----
    if (action === "file-shared") {
      const { fileData } = eventData;
      if (!fileData) return res.status(400).json({ error: "Missing fileData" });

      await broadcastToRoom(apiGateway, meetingId, "receive-file", {
        ...fileData,
        uploadedBy: role,
        socketId: connectionId,
      }, connectionId);

      return res.status(200).json({ success: true });
    }

    // ---- Unknown action ----
    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error("WebSocket handler error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}