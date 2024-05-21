import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

export default function MeetingPage() {
  const [peers, setPeers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef();

  useEffect(() => {
    const socket = io("/api/ws"); // Connect to the WebSocket server

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;

        // Listen for new peer connection
        socket.on("signal", (data) => {
          const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
          });
          peer.signal(data.signal);
          peer.on("stream", (remoteStream) => {
            setPeers((prevPeers) => [...prevPeers, peer]); // Add new peer to peers state
          });
        });

        // Create peer connection
        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream,
        });
        peer.on("signal", (signal) => {
          socket.emit("signal", { signal });
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      peers.forEach((peer) => peer.destroy());
      socket.disconnect();
    };
  }, []);

  const toggleAudio = () => {
    const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setAudioEnabled(audioTrack.enabled);
  };

  const toggleVideo = () => {
    const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    setVideoEnabled(videoTrack.enabled);
  };

  return (
    <div className="meeting-container">
      <video ref={videoRef} autoPlay playsInline className="video-element" />

      <div className="controls">
        <button onClick={toggleAudio}>
          {audioEnabled ? (
            <i className="fas fa-microphone"></i>
          ) : (
            <i className="fas fa-microphone-slash"></i>
          )}
        </button>
        <button onClick={toggleVideo}>
          {videoEnabled ? (
            <i className="fas fa-video"></i>
          ) : (
            <i className="fas fa-video-slash"></i>
          )}
        </button>
      </div>

      <style jsx>{`
        .meeting-container {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f0f0f0;
        }

        .video-element {
          width: 80%;
          max-width: 800px;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        }

        .controls {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        }

        .controls button {
          background: none;
          border: none;
          cursor: pointer;
          margin: 0 8px;
        }

        .controls button i {
          font-size: 24px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
