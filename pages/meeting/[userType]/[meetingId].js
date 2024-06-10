import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import usePeerConnection from "../../../src/lib/peer";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";
import { userTypeConstant } from "../../../src/constant";

const socket = io();

const RoomPage = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioRemoteEnabled, setAudioRemoteEnabled] = useState(true);
  const [videoRemoteEnabled, setVideoRemoteEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const {
    peer,
    getOffer,
    getAnswer,
    setLocalDescription,
    addEventListener,
    removeEventListener,
  } = usePeerConnection();

  const pathSegments = window.location.pathname.split("/");
  const userType = pathSegments[pathSegments.length - 2]; // 'patient' in this case
  const meetingId = pathSegments[pathSegments.length - 1]; // '12345' in this case

  console.log("User Type:", userType);
  console.log("Meeting ID:", meetingId);

  const sendStreams = useCallback(() => {
    if (!peer || !myStream) return;
    for (const track of myStream.getTracks()) {
      peer.addTrack(track, myStream);
    }
  }, [myStream, peer]);

  const handleUserJoined = useCallback(({ id }) => {
    console.log(`User with id ${id} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const offer = await getOffer();
      console.log("Sending offer:", offer);
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error in handleCallUser:", error);
    }
  }, [remoteSocketId, socket, getOffer, peer]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      if (!peer) {
        console.error("Peer connection is not initialized");
        return;
      }
      try {
        console.log("Incoming call offer:", offer);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
        setRemoteSocketId(from);
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        console.log("Sending answer:", answer);
        socket.emit("call:accepted", { to: from, answer });
      } catch (error) {
        console.error("Error in handleIncomingCall:", error);
      }
    },
    [socket, peer]
  );

  const handleCallAccepted = useCallback(
    async ({ from, answer }) => {
      if (!peer) {
        console.error("Peer connection is not initialized");
        return;
      }
      try {
        console.log("Call accepted with answer:", answer);
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        sendStreams();
      } catch (error) {
        console.error("Error in handleCallAccepted:", error);
      }
    },
    [sendStreams, peer]
  );

  const handleNegoNeeded = useCallback(async () => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    const offer = await getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, getOffer, peer]);

  useEffect(() => {
    addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded, addEventListener, removeEventListener]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      if (!peer) {
        console.error("Peer connection is not initialized");
        return;
      }
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("peer:nego:done", { to: from, answer });
    },
    [getAnswer, peer]
  );

  const handleNegoNeedFinal = useCallback(
    async ({ answer }) => {
      if (!peer) {
        console.error("Peer connection is not initialized");
        return;
      }
      console.log(peer, "peer in nego need final");
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    },
    [peer]
  );

  const handleStreamUpdate = useCallback(({ socketId, type, enabled }) => {
    console.log(`${socketId} of ${type} is ${enabled} now`);
  }, []);

  useEffect(() => {
    addEventListener("track", async (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
    });
  }, [addEventListener]);

  const socketInitializer = async () => {
    await fetch("/api/lib/socket");
    socket.emit("room:join", { roomId: meetingId });
    
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("stream-update", handleStreamUpdate);
  };

  useEffect(() => {
    socketInitializer();
    
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("stream-update", handleStreamUpdate);
    };
  }, [
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleStreamUpdate,
  ]);

  useEffect(() => {
    if (myStream && localVideoRef.current) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteSocketId) {
      handleCallUser();
    }
  }, [handleCallUser, remoteSocketId]);

  const toggleLocalAudio = () => {
    const audioTrack = myStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setAudioEnabled(audioTrack.enabled);

    // Emit Socket.IO event
    socket.emit("stream-update", {
      socketId: socket.id, // Assuming you have mySocketId
      type: "audio",
      enabled: audioTrack.enabled,
    });
  };

  const toggleLocalVideo = () => {
    const videoTrack = myStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setVideoEnabled(videoTrack.enabled);
    console.log(socket.id, "testing socket id ");
    // Emit Socket.IO event
    socket.emit("stream-update", {
      socketId: socket.id,
      type: "video",
      enabled: videoTrack.enabled,
    });
  };

  const toggleRemoteAudio = () => {
    const audioTrack = remoteStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setAudioRemoteEnabled(audioTrack.enabled);
    console.log(audioTrack, "audio track in local");
    // Emit Socket.IO event
    socket.emit("stream-update", {
      socketId: remoteSocketId, // Assuming you have mySocketId
      type: "audio",
      enabled: audioTrack.enabled,
    });
  };

  const toggleRemoteVideo = () => {
    const videoTrack = remoteStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setVideoRemoteEnabled(videoTrack.enabled);
    console.log(remoteSocketId, "remote socket id");
    // Emit Socket.IO event
    socket.emit("stream-update", {
      socketId: remoteSocketId,
      type: "video",
      enabled: videoTrack.enabled,
    });
  };

  const handleDisconnect = () => {
    const confirmDisconnect = window.confirm("Are you sure you want to quit?");
    if (confirmDisconnect) {
      // Logic to disconnect the call
      if (peer) {
        peer.close();
      }
      socket.disconnect();
    }
  };

  return (
    <div className="meeting-container">
      {!remoteSocketId && userType === "patient" && (
        <div className="message-container">
          <h2>Please wait for the doctor and feel free to contact us.</h2>
        </div>
      )}
      {!remoteSocketId && userType === "doctor" && (
        <div className="message-container">
          <h2>Waiting for the patient to join.</h2>
        </div>
      )}
      <div className="video-container">
        {myStream && (
          <div className={`video-wrapper ${isSpeaking ? "speaking" : ""}`}>
            <h2>Patient</h2>
            <video
              ref={localVideoRef}
              className="video-element"
              autoPlay
              muted
              playsInline
            />
            {userType !== userTypeConstant.doctor && (
              <div className="controls">
                <button onClick={toggleLocalAudio}>
                  {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </button>
                <button onClick={toggleLocalVideo}>
                  {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                </button>
                <button onClick={handleDisconnect}>
                  <FaPhoneSlash />
                </button>
              </div>
            )}
          </div>
        )}
        {remoteStream && (
          <div className={`video-wrapper ${isSpeaking ? "speaking" : ""}`}>
            <h2>Doctor</h2>
            <video
              ref={remoteVideoRef}
              className="video-element"
              autoPlay
              playsInline
            />
            {userType !== userTypeConstant.patient && (
              <div className="controls">
                <button onClick={toggleRemoteAudio}>
                  {audioRemoteEnabled ? (
                    <FaMicrophone />
                  ) : (
                    <FaMicrophoneSlash />
                  )}
                </button>
                <button onClick={toggleRemoteVideo}>
                  {videoRemoteEnabled ? <FaVideo /> : <FaVideoSlash />}
                </button>
                <button onClick={handleDisconnect}>
                  <FaPhoneSlash />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        .meeting-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100vh;
          background-color: #f0f0f0;
          padding: 20px;
        }
        .video-container {
          display: flex;
          justify-content: space-around;
          width: 100%;
          max-width: 1200px;
        }
        .video-wrapper {
          flex: 1;
          margin: 10px;
          position: relative;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        }
        .video-wrapper.speaking {
          border: 4px solid green;
        }
        .video-element {
          width: 100%;
          height: 500px;
          border-radius: 8px;
        }
        .controls {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }
        .controls button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
};

export default RoomPage;
