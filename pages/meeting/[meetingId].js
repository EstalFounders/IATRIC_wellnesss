import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import { FaMicrophone, FaVideo, FaVideoSlash } from "react-icons/fa";
import { PiMicrophoneSlashFill } from "react-icons/pi";

export default function MeetingPage() {
  const [peers, setPeers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef();

  useEffect(() => {
    const socket = io("/api/ws"); // Connect to the WebSocket server
    const meetingId = window.location.pathname.split("/").pop();

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;

        socket.emit("joinRoom", meetingId); // Join the room

        socket.on("userJoined", (userId) => {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
          });
          peer.on("signal", (signal) => {
            socket.emit("signal", { signal, meetingId, userId });
          });
          setPeers((prevPeers) => [...prevPeers, { userId, peer }]);
        });

        socket.on("signal", (data) => {
          const existingPeer = peers.find(
            (peer) => peer.userId === data.callerId
          );
          if (existingPeer) {
            existingPeer.peer.signal(data.signal);
          } else {
            const peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream,
            });
            peer.signal(data.signal);
            setPeers((prevPeers) => [
              ...prevPeers,
              { userId: data.callerId, peer },
            ]);
          }
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    return () => {
      peers.forEach((peer) => peer.peer.destroy());
      socket.emit("leaveRoom", meetingId); // Leave the room
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
            <FaMicrophone size={22} />
          ) : (
            <PiMicrophoneSlashFill size={22} />
          )}
        </button>
        <button onClick={toggleVideo}>
          {videoEnabled ? <FaVideo size={22} /> : <FaVideoSlash size={22} />}
        </button>
      </div>

      <div className="participants">
        {peers.map((peer) => (
          <video
            key={peer.userId}
            ref={peer.videoRef}
            autoPlay
            playsInline
            className="participant-video"
          />
        ))}
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
          bottom: 120px;
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

        .participants {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .participant-video {
          width: 120px;
          height: 90px;
          border-radius: 8px;
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
