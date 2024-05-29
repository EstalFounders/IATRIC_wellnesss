import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import usePeerConnection from "../../src/lib/peer";
import ReactPlayer from "react-player";

const socket = io();

const RoomPage = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const {
    peer,
    getOffer,
    getAnswer,
    setLocalDescription,
    addEventListener,
    removeEventListener,
  } = usePeerConnection();

  const meetingId = window.location.pathname.split("/").pop();

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
      console.log('Sending offer:', offer);
      socket.emit("user:call", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error in handleCallUser:", error);
    }
  }, [remoteSocketId, socket, getOffer, peer]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    try {
      console.log('Incoming call offer:', offer);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      setRemoteSocketId(from);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      console.log('Sending answer:', answer);
      socket.emit("call:accepted", { to: from, answer });
    } catch (error) {
      console.error("Error in handleIncomingCall:", error);
    }
  }, [socket, peer]);

  const handleCallAccepted = useCallback(async ({ from, answer }) => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    try {
      console.log('Call accepted with answer:', answer);
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      sendStreams();
    } catch (error) {
      console.error("Error in handleCallAccepted:", error);
    }
  }, [sendStreams, peer]);

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

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("peer:nego:done", { to: from, answer });
  }, [getAnswer, peer]);

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    if (!peer) {
      console.error("Peer connection is not initialized");
      return;
    }
    console.log(peer, 'peer in nego need final');
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  }, [peer]);
  

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
  };

  useEffect(() => {
    socketInitializer();

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (myStream && videoRef.current) {
      videoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteSocketId) {
      handleCallUser();
    }
  }, [handleCallUser, remoteSocketId]);

  const toggleAudio = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <div className="meeting-container">
      <div>
        {myStream && (
          <>
          <h1>My Stream</h1>
            <ReactPlayer
              playing
              muted
              height="100px"
              width="200px"
              url={myStream}
            />
          </>
        )}
        {remoteStream && (
          <>
            <h1>Remote Stream</h1>
            <ReactPlayer
              playing
              muted
              height="100px"
              width="200px"
              url={remoteStream}
            />
            {console.log(remoteStream, 'remote stream ')}
          </>
        )}
      </div>
      <div className="participants"></div>
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
          display: flex;
          gap: 10px;
        }

        .controls button {
          background: none;
          border: none;
          cursor: pointer;
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
};

export default RoomPage;
