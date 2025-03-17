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
import { StreamChat } from "stream-chat"; // ✅ Import StreamChat SDK
import "stream-chat-react/dist/css/v2/index.css";

const apiKey = "g79jjc7r3tvm";

const CustomMessage = (props) => {
  const { message, isMyMessage } = props;

  return (
    <div className={`custom-message ${isMyMessage ? "sent" : "received"}`}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
      </div>
    </div>
  );
};


export default function App() {
  const callType = "default";
  const pathSegments = window.location.pathname.split("/");
  const userType = pathSegments[pathSegments.length - 2]; // 'patient' or 'doctor'
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

  const user = {
    id: user_id,
    name: userType === "patient" ? "Patient" : "Doctor",
    image: `https://getstream.io/random_svg/?id=${user_id}&name=${userType}`,
  };

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const initClientAndCall = async () => {
      const token = await tokenProvider();

      // ✅ Initialize Stream Video Client
      const streamClient = new StreamVideoClient({
        apiKey,
        user,
        token,
      });
      setClient(streamClient);

      const streamCall = streamClient.call(callType, meetingId);
      if (userType === "patient") {
        await streamCall.camera.enable();
        await streamCall.microphone.enable();
      }
      await streamCall.join({ create: true });
      setCall(streamCall);

      // ✅ Initialize Stream Chat Client without hooks
      const chatClient = new StreamChat(apiKey);
      await chatClient.connectUser(user, token);
      setChatClient(chatClient);

      // ✅ Create a chat channel
      const chatChannel = chatClient.channel("messaging", meetingId, {
        name: "Doctor & Patient Chat",
        members: ["patient-test-user", "doctor-test-user"],
      });

      await chatChannel.watch();
      setChannel(chatChannel);
    };

    initClientAndCall();

    return () => {
      if (call && call.state.callingState !== CallingState.LEFT) {
        call.leave().catch((e) => console.error("Failed to leave call", e));
      }
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [userType]);

  if (!client || !call || !chatClient || !channel) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Video Call Section */}
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>

      {/* Chat Section */}
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div style={{ width: "300px", borderLeft: "1px solid #ddd", padding: "10px", height: "85%" }}>
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
export const MyUILayout = () => {
  const { useCallCallingState, useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const firstRemoteParticipant = remoteParticipants[0];

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <ParticipantView participant={localParticipant} className="m-3" />
        {firstRemoteParticipant && <ParticipantView participant={firstRemoteParticipant} className="m-3" />}
      </div>
      <CallControls />
    </StreamTheme>
  );
};
