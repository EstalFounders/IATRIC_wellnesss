// usePeerConnection.js
import { useState, useEffect, useCallback } from 'react';

const usePeerConnection = () => {
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    setPeer(pc);

    return () => {
      pc.close();
    };
  }, []);

  const getOffer = useCallback(async () => {
    if (peer) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }, [peer]);

  const getAnswer = useCallback(async (offer) => {
    if (peer) {
      console.log(offer, 'peer in getAnswer function');
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    } else {
      console.error("Peer connection is not initialized");
    }
  }, [peer]);

  const setLocalDescription = useCallback(async (answer) => {
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, [peer]);

  const addEventListener = useCallback((event, callback) => {
    if (peer) {
      peer.addEventListener(event, callback);
    }
  }, [peer]);

  const removeEventListener = useCallback((event, callback) => {
    if (peer) {
      peer.removeEventListener(event, callback);
    }
  }, [peer]);

  return {
    peer,
    getOffer,
    getAnswer,
    setLocalDescription,
    addEventListener,
    removeEventListener,
  };
};

export default usePeerConnection;
