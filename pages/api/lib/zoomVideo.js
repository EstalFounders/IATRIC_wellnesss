// // Assuming you've installed 'zoomus' library using npm or yarn

// import zoomClient from "../../../src/lib/zoomSdkClient";

// export async function createZoomMeetingUrl() {
//   console.log("7 in create zoom meeting url");
//   try {
//     // Create Zoom meeting
//     const meeting = await zoomClient.meeting.create({
//       host_email: hostEmail,
//       topic,
//       type: 2, // Scheduled meeting
//       start_time: new Date().toISOString(), // Start time (now)
//       duration,
//       timezone,
//     });

//     // Extract meeting URL
//     const meetingUrl = meeting.join_url;
//     return meetingUrl;
//   } catch (error) {
//     console.error("Error creating Zoom meeting:", error);
//     throw error;
//   }
// }

export default async function createZoomMeetingUrl(req, res) {
  const zoomApiUrl = "https://api.zoom.us/v2/users/me/meetings";

  const accessToken = process.env.ZOOM_API_KEY; // Ensure this is your OAuth access token

  const meetingData = {
    topic: "Online consultation",
    type: 2, // Scheduled meeting
    start_time: new Date().toISOString(),
    duration: 60,
    timezone: "UTC",
  };

  try {
    const response = await fetch(zoomApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Correctly formatted Bearer token
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData), // Stringify the meetingData object
    });
    console.log(response, 'response')
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const meetingResponse = await response.json();
    res.status(200).json({ meetingUrl: meetingResponse.join_url });
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
}
