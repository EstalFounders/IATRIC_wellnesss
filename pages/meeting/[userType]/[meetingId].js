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
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";

const apiKey = "g79jjc7r3tvm";

// Consultation types to detect
const CONSULTATION_TYPE_AUDIO = "Call";
const CONSULTATION_TYPE_VIDEO = "Video";

export default function App() {
  const callType = "default";
  const pathSegments = window.location.pathname.split("/");
  const userType = pathSegments[pathSegments.length - 2]; // 'patient' or 'doctor'
  const meetingId = pathSegments[pathSegments.length - 1];

  const user_id =
    userType === "patient" ? "patient-test-user" : "doctor-test-user";

  const tokenProvider = async () => {
    const response = await fetch(
      `/api/auth/generateStreamToken?userId=${user_id}`
    );
    const data = await response.json();
    return data.token;
  };

  const user = {
    id: user_id,
    name: userType === "patient" ? "Patient" : "Doctor",
    image: `https://getstream.io/random_svg/?id=${user_id}&name=${userType}`,
  };

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [consultationType, setConsultationType] = useState(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);

  // Fetch appointment details by meetingId to get consultation type
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(
          `/api/bookConsultation?meetingId=${meetingId}`
        );
        const data = await response.json();
        if (data.appointment) {
          setConsultationType(data.appointment.consultationType);
        } else {
          console.warn("Appointment not found for meetingId:", meetingId);
        }
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
      } finally {
        setAppointmentLoading(false);
      }
    };
    fetchAppointment();
  }, [meetingId]);

  useEffect(() => {
    const initClientAndCall = async () => {
      const token = await tokenProvider();

      // Initialize Stream Video Client
      const streamClient = new StreamVideoClient({
        apiKey,
        user,
        token,
      });
      setClient(streamClient);

      const streamCall = streamClient.call(callType, meetingId);

      // Apply media restrictions based on consultation type
      if (consultationType === CONSULTATION_TYPE_AUDIO) {
        // AUDIO only: disable camera, enable microphone
        await streamCall.camera.disable();
        await streamCall.microphone.enable();
      } else if (consultationType === CONSULTATION_TYPE_VIDEO) {
        // VIDEO: enable both camera and microphone
        await streamCall.camera.enable();
        await streamCall.microphone.enable();
      } else {
        // Default/fallback: enable both for patient
        if (userType === "patient") {
          await streamCall.camera.enable();
          await streamCall.microphone.enable();
        }
      }

      await streamCall.join({ create: true });
      setCall(streamCall);

      // Initialize Stream Chat Client
      const chatClient = new StreamChat(apiKey);
      await chatClient.connectUser(user, token);
      setChatClient(chatClient);

      // Create a chat channel
      const chatChannel = chatClient.channel("messaging", meetingId, {
        name: "Doctor & Patient Chat",
        members: ["patient-test-user", "doctor-test-user"],
      });

      await chatChannel.watch();
      setChannel(chatChannel);
    };

    // Only initialize once consultationType is known (or confirmed missing)
    if (!appointmentLoading) {
      initClientAndCall();
    }

    return () => {
      if (call && call.state.callingState !== CallingState.LEFT) {
        call.leave().catch((e) => console.error("Failed to leave call", e));
      }
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [appointmentLoading, consultationType, userType]);

  if (appointmentLoading || !client || !call || !chatClient || !channel)
    return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Video Call Section */}
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout consultationType={consultationType} />
        </StreamCall>
      </StreamVideo>

      {/* Chat Section */}
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div
            style={{
              width: "300px",
              borderLeft: "1px solid #ddd",
              padding: "10px",
              height: "85%",
            }}
          >
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </div>
        </Channel>
      </Chat>
    </div>
  );
}

// Video Layout
export const MyUILayout = ({ consultationType }) => {
  const {
    useCallCallingState,
    useLocalParticipant,
    useRemoteParticipants,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const firstRemoteParticipant = remoteParticipants[0];
  const isAudioOnly = consultationType === CONSULTATION_TYPE_AUDIO;

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      {isAudioOnly ? (
        /* Audio-only layout: show placeholder with audio controls */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#1c1e21",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 48, color: "#fff" }}>🎧</span>
          </div>
          <p style={{ color: "#666", marginBottom: 16 }}>
            You are on an audio-only call
          </p>
          <CallControls />
        </div>
      ) : (
        /* Video layout: show participant views with full controls */
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80vh",
            }}
          >
            <ParticipantView participant={localParticipant} className="m-3" />
            {firstRemoteParticipant && (
              <ParticipantView
                participant={firstRemoteParticipant}
                className="m-3"
              />
            )}
          </div>
          <CallControls />
        </div>
      )}
    </StreamTheme>
  );
};