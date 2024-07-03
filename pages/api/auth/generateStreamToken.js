import { StreamChat } from "stream-chat";

export default async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const serverSideClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
      process.env.STREAM_SECRET_KEY
    );

    const token = serverSideClient.createToken(userId);
    
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return res.status(500).json({ error: "Failed to generate Stream token" });
  }
};
