"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "../../../styles/Meeting.module.css";
import chatStyles from "../../../styles/components/ChatPanel.module.css";
import fileStyles from "../../../styles/components/FileShare.module.css";
import infoStyles from "../../../styles/components/ParticipantInfo.module.css";
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  MeetingSessionConfiguration,
  LogLevel,
} from "amazon-chime-sdk-js";

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const getFileIcon = (type) => {
  if (type.startsWith("image/")) return { emoji: "🖼️", className: fileStyles.fileIconImage };
  if (type === "application/pdf") return { emoji: "📄", className: fileStyles.fileIconPdf };
  if (type.includes("document") || type.includes("sheet") || type.includes("text")) return { emoji: "📝", className: fileStyles.fileIconDoc };
  return { emoji: "📁", className: fileStyles.fileIconGeneric };
};

const useTimer = (isRunning) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);
  const format = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  return { elapsed, formattedTime: format(elapsed) };
};

const SidePanel = ({ activeTab, onTabChange, onClose, consultation, messages, onSendMessage, files, onFileUpload, onFileDownload, userType, remoteTyping }) => {
  const [chatText, setChatText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!chatText.trim()) return;
    onSendMessage(chatText);
    setChatText("");
    setIsTyping(false);
    const mid = consultation?.meetingId || consultation?._id;
    if (mid && window.__ws) {
      window.__ws.send(JSON.stringify({ action: "typing", meetingId: mid, isTyping: false }));
    }
  };

  const handleTextChange = (e) => {
    setChatText(e.target.value);
    setIsTyping(true);
    const mid = consultation?.meetingId || consultation?._id;
    if (mid && window.__ws) {
      window.__ws.send(JSON.stringify({ action: "typing", meetingId: mid, isTyping: true }));
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (mid && window.__ws) {
        window.__ws.send(JSON.stringify({ action: "typing", meetingId: mid, isTyping: false }));
      }
    }, 2000);
  };

  const handleEmojiSelect = (emoji) => {
    setChatText((prev) => prev + emoji);
    setShowEmoji(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    Array.from(e.dataTransfer.files).forEach((file) => onFileUpload(file, setUploadProgress));
  };

  const handleFileSelect = (e) => {
    Array.from(e.target.files).forEach((file) => onFileUpload(file, setUploadProgress));
    e.target.value = "";
  };

  const isDoctor = userType === "doctor";
  const patientName = consultation?.name || "Patient";
  const doctorName = consultation?.doctorDetails?.name || "Doctor";
  const doctorSpecialty = consultation?.doctorDetails?.speciality || "General";
  const patientMobNo = consultation?.patientMobNo || "";
  const consultationPrice = consultation?.consultationprice || "";
  const consultationType = consultation?.consultationType || "Audio";
  const appointmentTime = consultation?.appointmentTime ? new Date(consultation.appointmentTime).toLocaleString() : "N/A";
  const status = consultation?.status || "OPEN";

  const tabs = [
    { id: "chat", label: "Chat", badge: messages.filter((m) => m.sender !== (isDoctor ? "Doctor" : "Patient")).length },
    { id: "files", label: "Files", badge: files.length },
    { id: "info", label: "Info" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styles.sidePanelTabs}>
        {tabs.map((tab) => (
          <button key={tab.id} className={`${styles.sidePanelTab} ${activeTab === tab.id ? styles.sidePanelTabActive : ""}`} onClick={() => onTabChange(tab.id)}>
            {tab.label}
            {tab.badge > 0 && <span className={styles.sidePanelTabBadge}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      <div className={styles.sidePanelContent}>
        {activeTab === "chat" && (
          <div className={chatStyles.chatContainer}>
            <div className={chatStyles.chatHeader}>
              <span className={chatStyles.chatTitle}>💬 Consultation Chat</span>
              <button className={chatStyles.chatCloseBtn} onClick={onClose}>✕</button>
            </div>
            {messages.length === 0 ? (
              <div className={chatStyles.emptyChat}>
                <div className={chatStyles.emptyChatIcon}>💬</div>
                <div className={chatStyles.emptyChatText}>No messages yet. Start the conversation!</div>
              </div>
            ) : (
              <div className={chatStyles.messagesContainer}>
                {messages.map((msg, i) => {
                  const isPatientMsg = msg.sender === "Patient";
                  return (
                    <div key={i} className={`${chatStyles.messageWrapper} ${isPatientMsg ? chatStyles.messageWrapperPatient : chatStyles.messageWrapperDoctor}`}>
                      <span className={chatStyles.messageSender}>{msg.sender}</span>
                      <div className={`${chatStyles.messageBubble} ${isPatientMsg ? chatStyles.messageBubblePatient : chatStyles.messageBubbleDoctor}`}>{msg.text}</div>
                      <span className={`${chatStyles.messageTimestamp} ${!isPatientMsg ? chatStyles.messageTimestampDoctor : ""}`}>{msg.timestamp}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
            {remoteTyping && (
              <div className={chatStyles.typingIndicator}>
                <span>{remoteTyping === "doctor" ? "Doctor" : "Patient"} is typing</span>
                <span className={chatStyles.typingDots}>
                  <span className={chatStyles.typingDot} /><span className={chatStyles.typingDot} /><span className={chatStyles.typingDot} />
                </span>
              </div>
            )}
            <form className={chatStyles.inputContainer} onSubmit={handleSend}>
              <button type="button" className={chatStyles.emojiBtn} onClick={() => setShowEmoji(!showEmoji)} title="Emoji">😊</button>
              <input className={chatStyles.chatInput} type="text" value={chatText} onChange={handleTextChange} placeholder="Type a message..." />
              <button type="submit" className={chatStyles.sendBtn} disabled={!chatText.trim()} title="Send">➤</button>
            </form>
            {showEmoji && (
              <div className={chatStyles.emojiPicker}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, padding: 8, background: "#2a2a4a", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                  {["😀","😂","😍","🤔","😢","😡","👍","👎","❤️","🎉","💊","🏥","🩺","📋","✅","❌"].map((emoji) => (
                    <button key={emoji} onClick={() => handleEmojiSelect(emoji)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4 }}>{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className={fileStyles.fileContainer}>
            <div className={fileStyles.fileHeader}>
              <span className={fileStyles.fileTitle}>📎 Shared Files</span>
              <button className={fileStyles.fileCloseBtn} onClick={onClose}>✕</button>
            </div>
            <div className={`${fileStyles.dropZone} ${dragActive ? fileStyles.dropZoneActive : ""}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <div className={fileStyles.dropZoneIcon}>📤</div>
              <div className={fileStyles.dropZoneText}>Drag & drop files here</div>
              <div className={fileStyles.dropZoneSubtext}>or click to browse</div>
            </div>
            <input ref={fileInputRef} type="file" className={fileStyles.hiddenInput} onChange={handleFileSelect} multiple />
            {uploadProgress.length > 0 && (
              <div className={fileStyles.uploadProgress}>
                {uploadProgress.map((p, i) => (
                  <div key={i} className={fileStyles.progressItem}>
                    <div className={fileStyles.progressBar}><div className={fileStyles.progressFill} style={{ width: `${p.progress}%` }} /></div>
                    <span className={fileStyles.progressText}>{p.progress}%</span>
                  </div>
                ))}
              </div>
            )}
            {files.length === 0 ? (
              <div className={fileStyles.emptyFiles}>
                <div className={fileStyles.emptyFilesIcon}>📁</div>
                <div className={fileStyles.emptyFilesText}>No files shared yet</div>
              </div>
            ) : (
              <div className={fileStyles.fileList}>
                {files.map((file, i) => {
                  const icon = getFileIcon(file.type);
                  return (
                    <div key={i} className={fileStyles.fileItem}>
                      <div className={`${fileStyles.fileIcon} ${icon.className}`}>{icon.emoji}</div>
                      <div className={fileStyles.fileInfo}>
                        <div className={fileStyles.fileName}>{file.name}</div>
                        <div className={fileStyles.fileMeta}>{formatFileSize(file.size)}</div>
                      </div>
                      <div className={fileStyles.fileActions}>
                        {file.type.startsWith("image/") && (
                          <button className={fileStyles.fileActionBtn} onClick={() => window.open(file.url, "_blank")} title="Preview">👁️</button>
                        )}
                        <button className={fileStyles.fileActionBtn} onClick={() => onFileDownload(file)} title="Download">⬇️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "info" && (
          <div className={infoStyles.panelContainer}>
            <div className={infoStyles.panelHeader}>
              <span className={infoStyles.panelTitle}>ℹ️ Meeting Info</span>
              <button className={infoStyles.panelCloseBtn} onClick={onClose}>✕</button>
            </div>
            <div className={infoStyles.panelContent}>
              <div className={infoStyles.userCard}>
                <div className={`${infoStyles.userAvatar} ${infoStyles.avatarDoctor}`}>👨‍⚕️</div>
                <div className={infoStyles.userDetails}>
                  <div className={infoStyles.userName}>{doctorName}</div>
                  <div className={infoStyles.userRole}>Doctor</div>
                  <div className={infoStyles.userSpecialty}>{doctorSpecialty}</div>
                  <div className={infoStyles.userStatus}>
                    <span className={`${infoStyles.statusDot} ${infoStyles.statusOnline}`} /> Online
                  </div>
                </div>
              </div>
              <div className={infoStyles.userCard}>
                <div className={`${infoStyles.userAvatar} ${infoStyles.avatarPatient}`}>👤</div>
                <div className={infoStyles.userDetails}>
                  <div className={infoStyles.userName}>{patientName}</div>
                  <div className={infoStyles.userRole}>Patient</div>
                  <div className={infoStyles.userSpecialty}>Mobile: {patientMobNo}</div>
                  <div className={infoStyles.userStatus}>
                    <span className={`${infoStyles.statusDot} ${infoStyles.statusOnline}`} /> Online
                  </div>
                </div>
              </div>
              <div className={infoStyles.section}>
                <div className={infoStyles.sectionTitle}>Consultation Details</div>
                <div className={infoStyles.appointmentDetails}>
                  <div className={infoStyles.appointmentRow}>
                    <span className={infoStyles.appointmentIcon}>📋</span>
                    <span className={infoStyles.appointmentText}>Status</span>
                    <span className={infoStyles.appointmentValue}>{status}</span>
                  </div>
                  <div className={infoStyles.appointmentRow}>
                    <span className={infoStyles.appointmentIcon}>🎧</span>
                    <span className={infoStyles.appointmentText}>Type</span>
                    <span className={infoStyles.appointmentValue}>{consultationType}</span>
                  </div>
                  {consultationPrice && (
                    <div className={infoStyles.appointmentRow}>
                      <span className={infoStyles.appointmentIcon}>💰</span>
                      <span className={infoStyles.appointmentText}>Fee</span>
                      <span className={infoStyles.appointmentValue}>₹{consultationPrice}</span>
                    </div>
                  )}
                  <div className={infoStyles.appointmentRow}>
                    <span className={infoStyles.appointmentIcon}>📅</span>
                    <span className={infoStyles.appointmentText}>Appointment</span>
                    <span className={infoStyles.appointmentValue}>{appointmentTime}</span>
                  </div>
                  <div className={infoStyles.appointmentRow}>
                    <span className={infoStyles.appointmentIcon}>🩺</span>
                    <span className={infoStyles.appointmentText}>Symptoms</span>
                    <span className={infoStyles.appointmentValue}>{consultation?.symptoms || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Helper: send message via WebSocket ----------
function wsSend(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export default function MeetingRoom({ consultation, userType, meetingId }) {
  const [meetingState, setMeetingState] = useState("connecting");
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [sidePanelTab, setSidePanelTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [remoteTyping, setRemoteTyping] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteAudioOn, setRemoteAudioOn] = useState(true);
  const [cameraToast, setCameraToast] = useState(null);
  const cameraToastTimerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const wsRef = useRef(null);
  const meetingSessionRef = useRef(null);
  const chimeObserverRef = useRef(null);
  const remoteTileIdRef = useRef(null);
  const localTileIdRef = useRef(null);
  const connectionIdRef = useRef(null);
  const domainNameRef = useRef(null);
  const stageRef = useRef(null);
  const { formattedTime } = useTimer(meetingState === "active");

  const isDoctor = userType === "doctor";
  const isAudioOnly = consultation?.consultationType === "Call";
  const mid = meetingId || consultation?.meetingId || consultation?._id;

  // ---- Helper to send messages through API Gateway backend ----
  const sendWsMessage = useCallback((action, extra = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const payload = {
      action,
      connectionId: connectionIdRef.current,
      meetingId: mid,
      role: userType,
      domainName: domainNameRef.current,
      stage: stageRef.current,
      ...extra,
    };
    ws.send(JSON.stringify(payload));
  }, [mid, userType]);

  // ---- Initialize Amazon Chime Session ----
  useEffect(() => {
    if (!mid) return;

    const initChime = async () => {
      try {
        const response = await fetch(`/api/chimeSession?meetingId=${mid}&userType=${userType}`);
        if (!response.ok) throw new Error(`Chime session API error: ${response.status}`);
        const chimeData = await response.json();
        console.log("Chime session data received");

        const configuration = new MeetingSessionConfiguration(chimeData.meeting, chimeData.attendee);
        const logger = new ConsoleLogger("ChimeSDK", LogLevel.INFO);
        const deviceController = new DefaultDeviceController(logger);
        const session = new DefaultMeetingSession(configuration, logger, deviceController);
        meetingSessionRef.current = session;
        const audioVideo = session.audioVideo;

        const observer = {
          videoTileDidUpdate: (tileState) => {
            if (!tileState.boundAttendeeId || tileState.isLocal) return;
            console.log("Remote video tile updated:", tileState.tileId);
            remoteTileIdRef.current = tileState.tileId;
            if (remoteVideoRef.current) audioVideo.bindVideoElement(tileState.tileId, remoteVideoRef.current);
            setRemoteVideoOn(true);
          },
          videoTileWasRemoved: (tileId) => {
            console.log("Remote video tile removed:", tileId);
            if (remoteTileIdRef.current === tileId) remoteTileIdRef.current = null;
            setRemoteVideoOn(false);
          },
          audioVideoDidStart: () => { console.log("Chime started"); setMeetingState("active"); },
          audioVideoDidStop: () => { console.log("Chime stopped"); setMeetingState("ended"); },
          connectionDidBecomePoor: () => console.log("Chime connection poor"),
          connectionDidRecover: () => console.log("Chime connection recovered"),
        };
        chimeObserverRef.current = observer;
        audioVideo.addObserver(observer);
        audioVideo.start();

        if (!isAudioOnly) {
          try {
            await audioVideo.startLocalVideoTile();
            setIsVideoOn(true);
            if (localVideoRef.current) {
              const localTile = audioVideo.getLocalVideoTile();
              if (localTile) {
                localTileIdRef.current = localTile.tileId;
                audioVideo.bindVideoElement(localTile.tileId, localVideoRef.current);
              }
            }
          } catch (err) {
            console.warn("Could not start local video:", err);
            setIsVideoOn(false);
          }
        }
      } catch (err) {
        console.error("Failed to initialize Chime session:", err);
        setMeetingState("ended");
      }
    };

    initChime();

    return () => {
      const session = meetingSessionRef.current;
      const observer = chimeObserverRef.current;
      if (session) {
        if (observer) session.audioVideo.removeObserver(observer);
        session.audioVideo.stop();
        meetingSessionRef.current = null;
      }
    };
  }, [mid, userType, isAudioOnly]);

  // ---- WebSocket Connection (replaces Socket.io) ----
  useEffect(() => {
    if (!mid) return;

    let ws = null;
    let reconnectTimer = null;

    const connectWs = async () => {
      try {
        // Fetch WebSocket URL from our API
        const urlRes = await fetch(`/api/get-ws-url?meetingId=${mid}&role=${userType}`);
        if (!urlRes.ok) throw new Error(`Failed to get WS URL: ${urlRes.status}`);
        const { url } = await urlRes.json();
        console.log("Connecting to WebSocket:", url);

        ws = new WebSocket(url);
        wsRef.current = ws;
        window.__ws = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          // Extract domain/stage from URL for API Gateway Management API replies
          const parsed = new URL(url);
          domainNameRef.current = parsed.hostname;
          stageRef.current = parsed.pathname.split("/")[1] || "production";

          // Send connect action
          const userName = isDoctor
            ? consultation?.doctorDetails?.name || "Doctor"
            : consultation?.name || "Patient";
          wsSend(ws, {
            action: "connect",
            meetingId: mid,
            role: userType,
            userData: { name: userName, role: userType },
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { action, ...payload } = data;

            // Store our connectionId from the server response
            if (action === "room-participants" && payload.yourSocketId) {
              connectionIdRef.current = payload.yourSocketId;
            }

            // ---- Dispatch actions to state handlers ----
            switch (action) {
              case "participant-joined":
                console.log("Participant joined:", payload);
                setParticipantCount(payload.participants?.length || 1);
                if (payload.participants?.length >= 2) setMeetingState("active");
                break;

              case "room-participants":
                console.log("Room participants:", payload);
                setParticipantCount(payload.participants?.length || 1);
                if (payload.participants?.length >= 2) {
                  if (setMeetingState) setMeetingState("active");
                } else {
                  setTimeout(() => {
                    if (ws && setMeetingState) setMeetingState("active");
                  }, 2000);
                }
                break;

              case "meeting-active":
                console.log("Meeting active");
                setMeetingState("active");
                break;

              case "receive-message":
                setMessages((prev) => {
                  if (payload.fromSocket && payload.fromSocket === connectionIdRef.current) return prev;
                  const newMsg = {
                    sender: payload.role === "doctor" ? "Doctor" : "Patient",
                    text: payload.text,
                    timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    type: payload.type || "text",
                    fromSocket: payload.socketId,
                  };
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg && lastMsg.fromSocket === payload.socketId && lastMsg.sender === newMsg.sender && lastMsg.text === newMsg.text && Math.abs(new Date(lastMsg.timestamp) - new Date(newMsg.timestamp)) < 500) return prev;
                  return [...prev, newMsg];
                });
                break;

              case "user-typing":
                setRemoteTyping(payload.isTyping ? payload.role : null);
                break;

              case "receive-file":
                setFiles((prev) => [...prev, {
                  id: Date.now().toString(),
                  name: payload.name,
                  size: payload.size,
                  type: payload.type,
                  url: payload.url,
                  uploadDate: payload.uploadDate || new Date().toISOString(),
                  uploadedBy: payload.uploadedBy || payload.role,
                }]);
                break;

              case "participant-left":
                console.log("Participant left:", payload);
                setParticipantCount(payload.participants?.length || 0);
                break;

              case "participant-media-change":
                console.log("Media change:", payload);
                if (payload.type === "video") setRemoteVideoOn(payload.value);
                if (payload.type === "audio") setRemoteAudioOn(payload.value);
                break;

              case "participant-camera-toggle":
                console.log("Camera toggle:", payload);
                setRemoteVideoOn(payload.isVideoOn);
                const displayName = payload.role === "doctor"
                  ? consultation?.doctorDetails?.name || "Doctor"
                  : consultation?.name || "Patient";
                const msg = payload.isVideoOn ? `${displayName} turned on camera` : `${displayName} turned off camera`;
                const icon = payload.isVideoOn ? "📷" : "📷❌";
                if (cameraToastTimerRef.current) clearTimeout(cameraToastTimerRef.current);
                setCameraToast({ icon, message: msg });
                cameraToastTimerRef.current = setTimeout(() => setCameraToast(null), 3000);
                break;

              default:
                break;
            }
          } catch (err) {
            console.error("Error parsing WS message:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          window.__ws = null;
          // Auto-reconnect after 3 seconds
          reconnectTimer = setTimeout(() => {
            if (mid) connectWs();
          }, 3000);
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

      } catch (err) {
        console.error("Failed to connect WebSocket:", err);
        // Retry after 5 seconds
        reconnectTimer = setTimeout(() => {
          if (mid) connectWs();
        }, 5000);
      }
    };

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (cameraToastTimerRef.current) clearTimeout(cameraToastTimerRef.current);
      if (ws) {
        // Send disconnect notification
        if (ws.readyState === WebSocket.OPEN && connectionIdRef.current && domainNameRef.current) {
          wsSend(ws, {
            action: "disconnect",
            connectionId: connectionIdRef.current,
            meetingId: mid,
            role: userType,
            domainName: domainNameRef.current,
            stage: stageRef.current,
          });
        }
        ws.close();
        wsRef.current = null;
        window.__ws = null;
      }
    };
  }, [mid, userType, isDoctor, consultation]);

  // ---- Re-assign remote video tile when remote camera turns back on ----
  useEffect(() => {
    const session = meetingSessionRef.current;
    if (remoteVideoOn && remoteVideoRef.current && remoteTileIdRef.current && session) {
      session.audioVideo.bindVideoElement(remoteTileIdRef.current, remoteVideoRef.current);
    }
  }, [remoteVideoOn]);

  // ---- Control Handlers (using Amazon Chime SDK + WebSocket notifications) ----
  const toggleMic = () => {
    const session = meetingSessionRef.current;
    if (!session) return;
    const audioVideo = session.audioVideo;
    const muted = !audioVideo.realtimeIsMuted();
    audioVideo.realtimeSetMuted(muted);
    setIsAudioOn(!muted);
    sendWsMessage("media-state-change", { type: "audio", value: !muted });
  };

  const toggleCamera = async () => {
    const session = meetingSessionRef.current;
    if (!session) return;
    const audioVideo = session.audioVideo;

    if (isVideoOn) {
      audioVideo.stopLocalVideoTile();
      if (localTileIdRef.current) {
        audioVideo.unbindVideoElement(localTileIdRef.current);
        localTileIdRef.current = null;
      }
      setIsVideoOn(false);
      sendWsMessage("media-state-change", { type: "video", value: false });
      sendWsMessage("camera-toggle", { isVideoOn: false });
    } else {
      try {
        await audioVideo.startLocalVideoTile();
        setIsVideoOn(true);
        const localTile = audioVideo.getLocalVideoTile();
        if (localTile && localVideoRef.current) {
          const tileId = localTile.tileId;
          localTileIdRef.current = tileId;
          audioVideo.bindVideoElement(tileId, localVideoRef.current);
        }
        sendWsMessage("media-state-change", { type: "video", value: true });
        sendWsMessage("camera-toggle", { isVideoOn: true });
      } catch (err) {
        console.error("Failed to start camera via Chime:", err);
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised((prev) => {
      const newVal = !prev;
      sendWsMessage("media-state-change", { type: "handRaise", value: newVal });
      return newVal;
    });
  };

  const endCall = () => {
    const session = meetingSessionRef.current;
    if (session) session.audioVideo.stop();
    setMeetingState("ended");
  };

  // ---- Chat ----
  const handleSendMessage = (text) => {
    const messageData = {
      text,
      sender: isDoctor ? "Doctor" : "Patient",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setMessages((prev) => [...prev, messageData]);
    sendWsMessage("send-message", { message: messageData });
  };

  // ---- File sharing ----
  const handleFileUpload = (file, setProgress) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) setProgress((prev) => [...prev, { name: file.name, progress: Math.round((e.loaded / e.total) * 100) }]);
    };
    reader.onload = () => {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadDate: new Date().toISOString(),
      };
      setFiles((prev) => [...prev, newFile]);
      setProgress((prev) => prev.filter((p) => p.name !== file.name));
      sendWsMessage("file-shared", { fileData: newFile });
    };
    reader.readAsDataURL(file);
  };

  const handleFileDownload = (file) => {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    a.click();
  };

  const doctorName = consultation?.doctorDetails?.name || "Doctor";
  const doctorSpecialty = consultation?.doctorDetails?.speciality || "General";
  const patientName = consultation?.name || "Patient";

  // ---- Connecting Screen ----
  if (meetingState === "connecting") {
    return (
      <div className={styles.container}>
        <div className={styles.connectingScreen}>
          <div className={styles.connectingSpinner} />
          <div className={styles.connectingTitle}>Connecting to consultation...</div>
          <div className={styles.connectingSubtitle}>Please wait while we establish a secure connection via Amazon Chime</div>
        </div>
      </div>
    );
  }

  // ---- Ended Screen ----
  if (meetingState === "ended") {
    return (
      <div className={styles.container}>
        <div className={styles.endedScreen}>
          <div className={styles.endedIcon}>📞</div>
          <div className={styles.endedTitle}>Consultation Ended</div>
          <div className={styles.endedDuration}>Duration: {formattedTime}</div>
        </div>
      </div>
    );
  }

  // ---- Active Call Screen ----
  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        <div className={styles.videoArea}>
          {isAudioOnly ? (
            <div className={styles.videoArea} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff" }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#1c1e21", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 48 }}>🎧</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Audio Consultation</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>You are on an audio-only call with {isDoctor ? patientName : doctorName}</div>
              {participantCount < 2 && (
                <div style={{ fontSize: 13, color: "#ffa502", marginTop: 16 }}>⏳ Waiting for the other participant to join...</div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.meetingHeader}>
                <div className={styles.meetingInfo}>
                  <div className={styles.meetingTitle}>Telemedicine Consultation</div>
                  <div className={styles.meetingId}>ID: {meetingId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 12, color: participantCount >= 2 ? "#2ed573" : "#ffa502" }}>
                    {participantCount >= 2 ? "🟢 Connected" : "🟡 Waiting..."}
                  </div>
                  <div className={styles.meetingTimer}>⏱️ {formattedTime}</div>
                  {isRecording && <div className={styles.recordingBadge}><span className={styles.recordingDot} />Recording</div>}
                </div>
              </div>
              <div className={`${styles.videoGrid} ${styles.videoGridDual}`}>
                <div className={styles.videoWrapper}>
                  {remoteVideoOn ? (
                    <video ref={remoteVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.videoPlaceholderAvatar}>{isDoctor ? "👤" : "👨‍⚕️"}</div>
                      <div className={styles.videoPlaceholderName}>{isDoctor ? patientName : doctorName}</div>
                      <div className={styles.videoPlaceholderRole}>{isDoctor ? "Patient" : `Doctor - ${doctorSpecialty}`}</div>
                      {!remoteVideoOn && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#ffa502" }}>📷 Camera Off</div>
                      )}
                    </div>
                  )}
                  <div className={styles.participantBadge}>
                    <span>{remoteAudioOn ? "🔊" : "🔇"}</span>
                    <span>{isDoctor ? patientName : doctorName}</span>
                  </div>
                </div>
                <div className={styles.videoWrapper}>
                  {isVideoOn ? (
                    <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.videoPlaceholderAvatar}>👤</div>
                      <div className={styles.videoPlaceholderName}>You</div>
                      <div className={styles.videoPlaceholderRole}>{isDoctor ? "Doctor" : "Patient"}</div>
                    </div>
                  )}
                  <div className={styles.participantBadge}><span>{isAudioOn ? "🔊" : "🔇"}</span><span>You</span></div>
                  {!isAudioOn && <div className={styles.participantMicOff}>🔇</div>}
                  {isHandRaised && <div className={styles.raisedHandIndicator}>✋</div>}
                </div>
              </div>
            </>
          )}

          {cameraToast && (
            <div className={styles.cameraToast}>
              <span className={styles.cameraToastIcon}>{cameraToast.icon}</span>
              <span className={styles.cameraToastMessage}>{cameraToast.message}</span>
            </div>
          )}
          <div className={styles.controlsBar}>
            <button className={`${styles.controlButton} ${!isAudioOn ? styles.controlButtonOff : ""}`} onClick={toggleMic} title={isAudioOn ? "Mute" : "Unmute"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isAudioOn ? (
                  <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                ) : (
                  <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                )}
              </svg>
              <span className={styles.controlLabel}>{isAudioOn ? "Mute" : "Unmute"}</span>
            </button>
            <button className={`${styles.controlButton} ${!isVideoOn ? styles.controlButtonOff : ""}`} onClick={toggleCamera} title={isVideoOn ? "Camera Off" : "Camera On"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isVideoOn ? (
                  <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
                ) : (
                  <><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l3-3h6l3 3h3a2 2 0 0 1 2 2v9.34"/></>
                )}
              </svg>
              <span className={styles.controlLabel}>{isVideoOn ? "Camera Off" : "Camera On"}</span>
            </button>
            <button className={`${styles.controlButton} ${isScreenSharing ? styles.controlButtonActive : ""}`} onClick={() => setIsScreenSharing((prev) => !prev)} title="Screen Share">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span className={styles.controlLabel}>Screen Share</span>
            </button>
            <button className={`${styles.controlButton} ${isHandRaised ? styles.controlButtonActive : ""}`} onClick={toggleHandRaise} title="Raise Hand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 18v-6a2 2 0 0 1 4 0v2"/><path d="M11 14V6a2 2 0 0 1 4 0v8"/><path d="M15 12V4a2 2 0 0 1 4 0v10"/><path d="M19 10V3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3"/><path d="M7 18v-6"/><path d="M3 21l3-3 3 3"/>
              </svg>
              <span className={styles.controlLabel}>Raise Hand</span>
            </button>
            <button className={`${styles.controlButton} ${isSidePanelOpen && sidePanelTab === "chat" ? styles.controlButtonActive : ""}`} onClick={() => { setSidePanelTab("chat"); setIsSidePanelOpen(true); }} title="Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className={styles.controlLabel}>Chat</span>
            </button>
            <button className={`${styles.controlButton} ${isSidePanelOpen && sidePanelTab === "files" ? styles.controlButtonActive : ""}`} onClick={() => { setSidePanelTab("files"); setIsSidePanelOpen(true); }} title="Files">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span className={styles.controlLabel}>Files</span>
            </button>
            <button className={`${styles.controlButton} ${isRecording ? styles.controlButtonActive : ""}`} onClick={() => setIsRecording((prev) => !prev)} title={isRecording ? "Stop Recording" : "Record"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill={isRecording ? "#ff4757" : "none"}/>
              </svg>
              <span className={styles.controlLabel}>{isRecording ? "Stop Rec" : "Record"}</span>
            </button>
            <button className={`${styles.controlButton} ${styles.controlButtonEnd}`} onClick={endCall} title="End Call">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className={styles.controlLabel}>End Call</span>
            </button>
          </div>
        </div>

        <div className={`${styles.sidePanel} ${!isSidePanelOpen ? styles.sidePanelClosed : ""}`}>
          {isSidePanelOpen && (
            <SidePanel
              activeTab={sidePanelTab}
              onTabChange={setSidePanelTab}
              onClose={() => setIsSidePanelOpen(false)}
              consultation={consultation}
              messages={messages}
              onSendMessage={handleSendMessage}
              files={files}
              onFileUpload={handleFileUpload}
              onFileDownload={handleFileDownload}
              userType={userType}
              remoteTyping={remoteTyping}
            />
          )}
        </div>
      </div>
    </div>
  );
}