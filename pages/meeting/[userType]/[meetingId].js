import {
  CallControls,
  CallingState,
  ParticipantView,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useEffect, useState } from "react";

export default function App() {
  const callType = "default";
  const pathSegments = window.location.pathname.split("/");
  const userType = pathSegments[pathSegments.length - 2]; // 'patient' in this case
  const meetingId = pathSegments[pathSegments.length - 1];

  console.log("User Type:", userType);
  console.log("Meeting ID:", meetingId);
  const user_id =
    userType === "patient" ? "patient-test-user" : "doctor-test-user";

  const tokenProvider = async () => {
    const response = await fetch(
      `/api/auth/generateStreamToken?userId=${user_id}`
    );
    const data = await response.json();
    return data.token;
  };

  const apiKey = "tg4yurp3jnkh";
  const callId = "iatric-" + Math.random().toString(16).substring(2);
  const user = {
    id: user_id,
    name: userType === "patient" ? "Patient" : "Doctor",
    image: `https://getstream.io/random_svg/?id=${user_id}&name=${userType}`,
  };

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    const initClientAndCall = async () => {
      const token = await tokenProvider();
      const streamClient = new StreamVideoClient({
        apiKey,
        user,
        token,
      });

      setClient(streamClient);

      const streamCall = streamClient.call(callType, meetingId);

      streamCall.on("participant_joined", (event) => {
        console.log("A participant joined:", event.participant);
      });

      if (userType === "patient") {
        await streamCall.camera.enable();
        await streamCall.microphone.enable();
      }

      await streamCall.join({ create: true });

      setCall(streamCall);
    };

    initClientAndCall();

    return () => {
      if (call && call.state.callingState !== CallingState.LEFT) {
        call.leave().catch((e) => console.error("Failed to leave call", e));
      }
    };
  }, [userType]);

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyUILayout />
      </StreamCall>
    </StreamVideo>
  );
}

export const MyUILayout = () => {
  const {
    useCallCallingState,
    useLocalParticipant,
    useRemoteParticipants,
    // ... other hooks
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  console.log(remoteParticipants, "remote participant");

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      <ParticipantView participant={localParticipant} />
      {remoteParticipants.map((participant) => (
        <ParticipantView key={participant.id} participant={participant} />
      ))}
      <CallControls />
    </StreamTheme>
  );
};
