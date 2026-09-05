"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "../../../styles/Meeting.module.css";
import chatStyles from "../../../styles/components/ChatPanel.module.css";
import fileStyles from "../../../styles/components/FileShare.module.css";
import infoStyles from "../../../styles/components/ParticipantInfo.module.css";
import { getSocket } from "../../lib/socket";

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
    // Notify server typing stopped
    const socket = getSocket();
    const mid = consultation?.meetingId || consultation?._id;
    if (mid) socket.emit("typing", { meetingId: mid, isTyping: false });
  };

  const handleTextChange = (e) => {
    setChatText(e.target.value);
    setIsTyping(true);
    // Emit typing event to server
    const socket = getSocket();
    const mid = consultation?.meetingId || consultation?._id;
    if (mid) socket.emit("typing", { meetingId: mid, isTyping: true });
    // Clear typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (mid) socket.emit("typing", { meetingId: mid, isTyping: false });
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
            {/* Remote typing indicator */}
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
                  {/* Hide the patient's mobile number from the doctor's view */}
                  {!isDoctor && (
                    <div className={infoStyles.userSpecialty}>Mobile: {patientMobNo}</div>
                  )}
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
  const [remoteStream, setRemoteStream] = useState(null);
  const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);
  const [remoteAudioOn, setRemoteAudioOn] = useState(true);
  // True once local camera/mic media is acquired so the WebRTC offer effect
  // can reliably re-run (refs alone never trigger a React re-render).
  const [localMediaReady, setLocalMediaReady] = useState(false);
  // Our own socket id (for deterministic initiator).
  const [mySocketId, setMySocketId] = useState(null);
  // The other participant's socket id (peer) for glare-free handshake.
  const [peerSocketId, setPeerSocketId] = useState(null);
  // Camera toggle toast notification
  const [cameraToast, setCameraToast] = useState(null);
  const cameraToastTimerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  // Plays the remote participant's audio during audio-only consultations.
  // The audio-only screen has no <video> element, so without this hidden
  // <audio> element neither participant could hear the other.
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  // ICE candidates that arrive before the remote SDP description is applied
  // get buffered here and flushed right after setRemoteDescription(). Without
  // this, trickle candidates are dropped with InvalidStateError and media
  // (audio) can never establish.
  const pendingIceCandidatesRef = useRef([]);
  const socketRef = useRef(null);
  const { formattedTime } = useTimer(meetingState === "active");

  const isDoctor = userType === "doctor";
  // "Audio" is the canonical booking type; "Call" is the legacy label used by
  // the previously committed code. Both mean an audio-only consultation.
  const isAudioOnly =
    consultation?.consultationType === "Audio" ||
    consultation?.consultationType === "Call";
  const mid = meetingId || consultation?.meetingId || consultation?._id;

  // ---- Socket.io Connection ----
  useEffect(() => {
    if (!mid) return;

    const socket = getSocket();
    socketRef.current = socket;
    setMySocketId(socket.id);

    const handleConnect = () => {
      console.log("Socket connected, joining room:", mid);
      setMySocketId(socket.id);
      const userName = isDoctor
        ? consultation?.doctorDetails?.name || "Doctor"
        : consultation?.name || "Patient";
      socket.emit("join-room", {
        meetingId: mid,
        role: userType,
        userData: { name: userName, role: userType },
      });
    };

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    // ---- Room members: identifiers for the deterministic handshake ----
    const extractPeers = (participants) => {
      if (!participants || participants.length < 2) {
        setPeerSocketId(null);
        return;
      }
      const other = participants.find((p) => p.socketId !== socket.id);
      setPeerSocketId(other?.socketId || null);
    };

    // Apply any ICE candidates that arrived before the remote description was
    // set (Trickle-ICE race) now that the SDP is in place.
    const flushPendingIceCandidates = async (pc) => {
      const pending = pendingIceCandidatesRef.current;
      if (!pc || !pc.remoteDescription || pending.length === 0) return;
      pendingIceCandidatesRef.current = [];
      console.log(`[WebRTC-DIAG] Flushing ${pending.length} buffered ICE candidate(s)`);
      for (const cand of pending) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.error("[WebRTC-DIAG] Buffered ICE candidate failed:", err);
        }
      }
    };

    // ---- Participant joined ----
    socket.on("participant-joined", (data) => {
      console.log("Participant joined:", data);
      setParticipantCount(data.participants?.length || 1);
      extractPeers(data.participants);
      if (data.participants && data.participants.length >= 2) {
        setMeetingState("active");
      }
    });

    // ---- Room participants (initial list) ----
    socket.on("room-participants", (data) => {
      console.log("Room participants:", data);
      setParticipantCount(data.participants?.length || 1);
      extractPeers(data.participants);
      if (data.participants && data.participants.length >= 2) {
        setMeetingState("active");
      } else {
        // First participant - show waiting state briefly then active
        setTimeout(() => setMeetingState("active"), 2000);
      }
    });

    // ---- Meeting active (both joined) ----
    socket.on("meeting-active", () => {
      console.log("Meeting active - both participants joined");
      setMeetingState("active");
    });

    // ---- Receive chat message ----
    socket.on("receive-message", (data) => {
      // Ignore messages from ourselves (safety net against server echo-back)
      if (data.socketId === socket.id) return;
      // Deduplicate: ignore if we already have a matching message from the same source
      const newMsg = {
        sender: data.role === "doctor" ? "Doctor" : "Patient",
        text: data.text,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: data.type || "text",
        fromSocket: data.socketId,
      };
      setMessages((prev) => {
        // Prevent duplicate: check if last message with same sender + text + socket already exists
        const lastMsg = prev[prev.length - 1];
        if (lastMsg &&
            lastMsg.fromSocket === data.socketId &&
            lastMsg.sender === newMsg.sender &&
            lastMsg.text === newMsg.text &&
            Math.abs(new Date(lastMsg.timestamp) - new Date(newMsg.timestamp)) < 500) {
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    // ---- Remote typing ----
    socket.on("user-typing", (data) => {
      if (data.isTyping) {
        setRemoteTyping(data.role);
      } else {
        setRemoteTyping(null);
      }
    });

    // ---- Receive file ----
    socket.on("receive-file", (data) => {
      const newFile = {
        id: Date.now().toString(),
        name: data.name,
        size: data.size,
        type: data.type,
        url: data.url,
        uploadDate: data.uploadDate || new Date().toISOString(),
        uploadedBy: data.uploadedBy || data.role,
      };
      setFiles((prev) => [...prev, newFile]);
    });

    // ---- Participant left ----
    socket.on("participant-left", (data) => {
      console.log("Participant left:", data);
      const newCount = data.participants?.length || 0;
      setParticipantCount(newCount);
      extractPeers(data.participants);

      // If we dropped below 2 participants, tear down the stale peer
      // connection so a fresh WebRTC handshake happens when the other
      // participant rejoins the room.
      if (newCount < 2 && peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
        peerConnectionRef.current = null;
        setIsWebRTCConnected(false);
        setRemoteStream(null);
      }
    });

    // ---- WebRTC: receive offer (I am the ANSWERER) ----
    socket.on("webrtc-offer", async ({ offer, from }) => {
      if (from === socket.id) return; // ignore own messages
      console.log("Received WebRTC offer (I am the ANSWERER)", {
        myRole: userType,
        peerRole: from,
      });
      try {
        // Wait (up to ~5s) for this side's local camera/mic to become ready
        // before answering. Without this, a slow audio-only ("Call") user
        // would never connect and the two parties could not talk.
        let waitedMs = 0;
        for (let i = 0; i < 20 && !localStreamRef.current; i++) {
          await new Promise((r) => setTimeout(r, 250));
          waitedMs += 250;
        }
        if (!localStreamRef.current) {
          // DIAGNOSTIC: this silent bail is a top suspect for one-way audio
          // (no answer is ever sent back to the offerer).
          console.error(
            `[WebRTC-DIAG] ANSWERER BAILED: no local media after ${waitedMs}ms — ` +
              "no answer sent, offerer will not receive our audio/media.",
          );
          return;
        }
        const localAudio = localStreamRef.current.getAudioTracks();
        const localVideo = localStreamRef.current.getVideoTracks();
        console.log("[WebRTC-DIAG] Answerer media state before answer", {
          audioTracks: localAudio.length,
          videoTracks: localVideo.length,
          audioEnabled: localAudio[0]?.enabled,
        });
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIceCandidates(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { meetingId: mid, answer });
      } catch (err) {
        console.error("Error handling WebRTC offer:", err);
      }
    });

    // ---- WebRTC: receive answer (I am the OFFERER) ----
    socket.on("webrtc-answer", async ({ answer, from }) => {
      if (from === socket.id) return;
      console.log("Received WebRTC answer (I am the OFFERER)", {
        myRole: userType,
        peerRole: from,
      });
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushPendingIceCandidates(pc);
        }
      } catch (err) {
        console.error("Error handling WebRTC answer:", err);
      }
    });

    // ---- WebRTC: receive ICE candidate ----
    // Trickle-ICE race guard: candidates can arrive before the remote SDP
    // description is set (InvalidStateError). Buffer them and flush once the
    // offer/answer has been applied above.
    socket.on("webrtc-ice-candidate", async ({ candidate, from }) => {
      if (from === socket.id) return;
      try {
        const pc = peerConnectionRef.current;
        if (!pc || !candidate) return;
        if (!pc.remoteDescription) {
          pendingIceCandidatesRef.current.push(candidate);
          console.log(
            `[WebRTC-DIAG] Buffered ICE candidate (remote SDP not set yet). Total buffered: ${pendingIceCandidatesRef.current.length}`,
          );
          return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        // In case of a race already past the guard, buffer instead of dropping.
        if (err?.name === "InvalidStateError" || pc?.remoteDescription === null) {
          pendingIceCandidatesRef.current.push(candidate);
          console.warn(
            "[WebRTC-DIAG] addIceCandidate failed early - buffered instead of dropped",
            err.message,
          );
        } else {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    // ---- Participant camera toggle notification ----
    socket.on("participant-camera-toggle", (data) => {
      console.log("Participant camera toggle:", data);
      // Update the remote video state
      setRemoteVideoOn(data.isVideoOn);
      // Blank the remote <video> element immediately when their camera turns off
      if (!data.isVideoOn && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      // Show a toast notification
      const displayName = data.role === "doctor"
        ? consultation?.doctorDetails?.name || "Doctor"
        : consultation?.name || "Patient";
      const message = data.isVideoOn
        ? `${displayName} turned on camera`
        : `${displayName} turned off camera`;
      const icon = data.isVideoOn ? "📷" : "📷❌";
      // Clear any existing toast timer
      if (cameraToastTimerRef.current) {
        clearTimeout(cameraToastTimerRef.current);
      }
      setCameraToast({ icon, message });
      // Auto-dismiss after 3 seconds
      cameraToastTimerRef.current = setTimeout(() => {
        setCameraToast(null);
      }, 3000);
    });

    return () => {
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (cameraToastTimerRef.current) {
        clearTimeout(cameraToastTimerRef.current);
      }
      socket.off("connect", handleConnect);
      socket.off("participant-joined");
      socket.off("room-participants");
      socket.off("meeting-active");
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("receive-file");
      socket.off("participant-left");
      socket.off("participant-media-change");
      socket.off("participant-camera-toggle");
    };
  }, [mid, userType, isDoctor, consultation]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit("leave-room", { meetingId: mid });
      }
    };
  }, [mid]);

  // ---- Create RTCPeerConnection helper ----
  const createPeerConnection = useCallback(() => {
    // Close existing connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      const incomingStream = event.streams[0];
      console.log("[WebRTC-DIAG] ontrack fired", {
        hasRemoteStream: !!incomingStream,
        audioTrackCount: incomingStream?.getAudioTracks?.().length || 0,
        videoTrackCount: incomingStream?.getVideoTracks?.().length || 0,
        myRole: isDoctor ? "doctor" : "patient",
      });
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => {});
      }
      setIsWebRTCConnected(true);

      // Keep remote camera/mic UI state in sync with the actual incoming tracks
      const videoTrack = remoteStream?.getVideoTracks?.()[0];
      const audioTrack = remoteStream?.getAudioTracks?.()[0];
      if (videoTrack) {
        setRemoteVideoOn(videoTrack.readyState === "live" && !videoTrack.muted);
        videoTrack.addEventListener("ended", () => setRemoteVideoOn(false));
        videoTrack.addEventListener("mute", () => setRemoteVideoOn(false));
        videoTrack.addEventListener("unmute", () => setRemoteVideoOn(true));
      }
      if (audioTrack) {
        setRemoteAudioOn(audioTrack.readyState === "live" && !audioTrack.muted);
        audioTrack.addEventListener("mute", () => setRemoteAudioOn(false));
        audioTrack.addEventListener("unmute", () => setRemoteAudioOn(true));
      }
    };

    // Send ICE candidates to the other peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket();
        socket.emit("webrtc-ice-candidate", {
          meetingId: mid,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      // DIAGNOSTIC: when we reach "connected", report which local tracks our
      // peer connection is actually sending (kind + live state).
      if (pc.iceConnectionState === "connected") {
        const senders = pc.getSenders().map((s) => ({
          kind: s.track?.kind || "null",
          label: s.track?.label || "",
          state: s.track?.readyState || "none",
          muted: s.track?.muted ?? "?",
        }));
        console.log("[WebRTC-DIAG] Connected. Local senders:", senders);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [mid, isDoctor]);

  // ---- Initialize local camera/mic ----
  // Video consultations request camera + mic.
  // Call / audio-only consultations request audio only (no camera)
  // so doctor & patient can still talk to each other in the same room.
  useEffect(() => {
    if (meetingState !== "active") return;
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          isAudioOnly ? { video: false, audio: true } : { video: true, audio: true }
        );
        localStreamRef.current = stream;
        if (isAudioOnly) {
          setIsVideoOn(false);
        }
        if (!isAudioOnly && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsAudioOn(true);
        setLocalMediaReady(true);
      } catch (err) {
        console.error("getUserMedia error:", err);
        setIsVideoOn(false);
        setIsAudioOn(false);
        setLocalMediaReady(false);
      }
    };
    initMedia();
    return () => {
      setLocalMediaReady(false);
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [meetingState, isAudioOnly]);

  // ---- Re-assign stream to local video element when toggling camera on/off ----
  // This ensures the newly mounted <video> element gets the stream after re-enabling camera
  useEffect(() => {
    if (isVideoOn && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isVideoOn]);

  // ---- Re-assign stream to remote video element when remote camera turns back on ----
  // Remote video element remounts when the ternary switches from placeholder to <video>
  useEffect(() => {
    if (remoteVideoOn && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteVideoOn, remoteStream]);

  // ---- Re-assign stream to remote audio element when audio-only call connects ----
  // The audio-only screen renders a hidden <audio> element instead of a
  // <video>, so this effect attaches the remote stream there (and replays it
  // whenever the stream arrives or the element remounts).
  useEffect(() => {
    if (isAudioOnly && remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => {
        console.error("Remote audio playback failed:", err);
      });
    }
  }, [isAudioOnly, remoteStream]);

  // ---- Initiate WebRTC (glare-free) when both participants + media are ready ----
  // Uses state (localMediaReady / mySocketId / peerSocketId) so React re-runs
  // this whenever media becomes ready or the peer joins the room, instead of
  // relying on a ref that never triggers a re-render.
  useEffect(() => {
    if (participantCount < 2 || !localMediaReady || !mySocketId || !peerSocketId) return;
    if (peerConnectionRef.current || isWebRTCConnected) return;

    // Deterministic initiator: only the participant with the smaller socket id
    // creates the offer. Exactly one offer is produced; the other answers.
    if (String(mySocketId) >= String(peerSocketId)) {
      console.log("Other peer will initiate the WebRTC offer.");
      return;
    }

    console.log("I initiate the WebRTC offer (smaller socket id)", {
      myRole: userType,
    });
    const timer = setTimeout(async () => {
      // Small settle time for tracks to attach to the stream.
      await new Promise((r) => setTimeout(r, 500));
      if (peerConnectionRef.current || !localStreamRef.current) return;
      try {
        const localAudio = localStreamRef.current.getAudioTracks();
        const localVideo = localStreamRef.current.getVideoTracks();
        console.log("[WebRTC-DIAG] Offerer media state before offer", {
          audioTracks: localAudio.length,
          videoTracks: localVideo.length,
          audioEnabled: localAudio[0]?.enabled,
        });
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const socket = getSocket();
        socket.emit("webrtc-offer", { meetingId: mid, offer });
        console.log("Sent WebRTC offer (initiator)");
      } catch (err) {
        console.error("Error creating WebRTC offer:", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [participantCount, localMediaReady, mySocketId, peerSocketId, createPeerConnection, mid, isWebRTCConnected]);

  // ---- Control Handlers ----
  const toggleMic = async () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        // Toggle enabled state of existing track
        audioTracks.forEach((t) => (t.enabled = !t.enabled));
        const isNowEnabled = audioTracks[0].enabled;
        setIsAudioOn(isNowEnabled);
        const socket = getSocket();
        if (mid) socket.emit("media-state-change", { meetingId: mid, type: "audio", value: isNowEnabled });
      } else {
        // No audio track - try to re-acquire
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          newStream.getAudioTracks().forEach((t) => localStreamRef.current.addTrack(t));
          setIsAudioOn(true);
          const socket = getSocket();
          if (mid) socket.emit("media-state-change", { meetingId: mid, type: "audio", value: true });
        } catch (err) {
          console.error("Failed to re-acquire audio:", err);
        }
      }
    }
  };

  const toggleCamera = async () => {
    // Camera is not available for audio-only (Call) consultations
    if (isAudioOnly) return;
    if (!localStreamRef.current) return;

    const videoTracks = localStreamRef.current.getVideoTracks();
    const socket = getSocket();
    const pc = peerConnectionRef.current;

    if (isVideoOn) {
      // Turn OFF: stop video tracks entirely (like Zoom/Meet behavior).
      // Remove tracks from the local stream and, importantly, replace the
      // outgoing WebRTC video track with null so the remote peer actually
      // stops receiving video (not just a UI placeholder).
      videoTracks.forEach((t) => {
        t.stop();
        localStreamRef.current.removeTrack(t);
      });
      setIsVideoOn(false);

      if (pc) {
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (videoSender) {
          videoSender
            .replaceTrack(null)
            .catch((err) => console.error("replaceTrack(null) failed:", err));
        }
      }

      if (mid) {
        socket.emit("media-state-change", { meetingId: mid, type: "video", value: false });
        socket.emit("camera-toggle", { meetingId: mid, isVideoOn: false, userId: userType });
      }
    } else {
      // Turn ON: re-acquire camera and send new track via WebRTC
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (newVideoTrack) {
          localStreamRef.current.addTrack(newVideoTrack);
          setIsVideoOn(true);

          // Replace the dead video track in the WebRTC peer connection with the new one
          if (pc) {
            const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
            if (videoSender) {
              await videoSender.replaceTrack(newVideoTrack);
              console.log("Replaced WebRTC video track with new camera feed");
            } else {
              // No existing video sender — add the track fresh
              pc.addTrack(newVideoTrack, localStreamRef.current);
            }
          }

          // Small delay to ensure React has mounted the <video> element
          setTimeout(() => {
            if (localVideoRef.current && localStreamRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          }, 50);
          if (mid) {
            socket.emit("media-state-change", { meetingId: mid, type: "video", value: true });
            socket.emit("camera-toggle", { meetingId: mid, isVideoOn: true, userId: userType });
          }
        }
      } catch (err) {
        console.error("Failed to re-acquire camera:", err);
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised((prev) => {
      const newVal = !prev;
      const socket = getSocket();
      if (mid) socket.emit("media-state-change", { meetingId: mid, type: "handRaise", value: newVal });
      return newVal;
    });
  };

  const endCall = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
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
    // Add locally
    setMessages((prev) => [...prev, messageData]);
    // Send via socket
    const socket = getSocket();
    if (mid) socket.emit("send-message", { meetingId: mid, message: messageData });
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
      // Share file via socket
      const socket = getSocket();
      if (mid) socket.emit("file-shared", { meetingId: mid, fileData: newFile });
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
          <div className={styles.connectingSubtitle}>Please wait while we establish a secure connection</div>
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
            <>
              <div className={styles.meetingHeader}>
                <div className={styles.meetingInfo}>
                  <div className={styles.meetingTitle}>🎧 Audio Consultation</div>
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
              {/* Hidden element required to play back the remote participant's
                  microphone during audio-only consultations. */}
              <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />
              <div className={`${styles.videoGrid} ${styles.videoGridDual}`}>
                <div className={styles.videoWrapper}>
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.videoPlaceholderAvatar}>{isDoctor ? "👤" : "👨‍⚕️"}</div>
                    <div className={styles.videoPlaceholderName}>{isDoctor ? patientName : doctorName}</div>
                    <div className={styles.videoPlaceholderRole}>{isDoctor ? "Patient" : `Doctor - ${doctorSpecialty}`}</div>
                    <div className={styles.videoPlaceholderRole} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                      {participantCount >= 2 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(46,213,115,0.15)", color: "#2ed573", fontSize: 12, fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ed573" }} /> Connected
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(255,165,2,0.15)", color: "#ffa502", fontSize: 12, fontWeight: 600 }}>
                          ⏳ Waiting for the other participant to join...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.participantBadge}>
                    <span>{remoteAudioOn ? "🔊" : "🔇"}</span>
                    <span>{isDoctor ? patientName : doctorName}</span>
                  </div>
                </div>
                <div className={styles.videoWrapper}>
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.videoPlaceholderAvatar}>👤</div>
                    <div className={styles.videoPlaceholderName}>You</div>
                    <div className={styles.videoPlaceholderRole}>{isDoctor ? "Doctor" : "Patient"}</div>
                  </div>
                  <div className={styles.participantBadge}><span>{isAudioOn ? "🔊" : "🔇"}</span><span>You</span></div>
                  {!isAudioOn && <div className={styles.participantMicOff}>🔇</div>}
                  {isHandRaised && <div className={styles.raisedHandIndicator}>✋</div>}
                </div>
              </div>
            </>
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
                  {isWebRTCConnected && remoteStream && remoteVideoOn ? (
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.videoPlaceholderAvatar}>{isDoctor ? "👤" : "👨‍⚕️"}</div>
                      <div className={styles.videoPlaceholderName}>{isDoctor ? patientName : doctorName}</div>
                      <div className={styles.videoPlaceholderRole}>{isDoctor ? "Patient" : `Doctor - ${doctorSpecialty}`}</div>
                      {isWebRTCConnected && !remoteVideoOn && (
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

          {/* Camera toggle toast notification */}
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
            <button
              className={`${styles.controlButton} ${!isVideoOn ? styles.controlButtonOff : ""} ${isAudioOnly ? styles.controlButtonDisabled : ""}`}
              onClick={toggleCamera}
              disabled={isAudioOnly}
              title={isAudioOnly ? "Camera unavailable in audio consultation" : isVideoOn ? "Camera Off" : "Camera On"}
            >
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