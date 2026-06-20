import { ChimeSDKMeetingsClient, CreateMeetingCommand, CreateAttendeeCommand } from "@aws-sdk/client-chime-sdk-meetings";

// Initialize Chime client. AWS SDK automatically looks for local credentials or environment variables.
const chimeClient = new ChimeSDKMeetingsClient({
  region: "us-east-1", // AWS Chime media routing control plane is centralized in us-east-1
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || "",
  }
});

export default async function handler(req, res) {
  // Ensure we only process GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract query variables from the inbound frontend request link
  const { meetingId, userType } = req.query;

  if (!meetingId || !userType) {
    return res.status(400).json({ error: 'Missing meetingId or userType path parameters' });
  }

  // Mock lookup configuration: match this with your data layer rules
  const consultationType = "Video"; // Fallback values can be "Video" or "Call"

  try {
    // 1. Create or fetch an ongoing media stream room targeting this matching custom token ID string
    const meetingCommand = new CreateMeetingCommand({
      ClientRequestToken: meetingId, 
      MediaRegion: "ap-south-1", // Routes media traffic closest to your deployment region
      ExternalMeetingId: meetingId
    });
    const meetingData = await chimeClient.send(meetingCommand);

    // 2. Register this unique participant attendee block into the newly registered meeting workspace
    const attendeeCommand = new CreateAttendeeCommand({
      MeetingId: meetingData.Meeting.MeetingId,
      ExternalUserId: `${userType}-test-user`
    });
    const attendeeData = await chimeClient.send(attendeeCommand);

    // 3. Return the fully formed credentials payload directly back to the frontend client component
    return res.status(200).json({
      meeting: meetingData.Meeting,
      attendee: attendeeData.Attendee,
      consultationType: consultationType
    });

  } catch (error) {
    console.error("Chime execution failure:", error);
    return res.status(500).json({ 
      error: "Failed to initialize native AWS Chime connection parameters", 
      details: error.message 
    });
  }
}
