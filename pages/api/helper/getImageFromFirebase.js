import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase"; // Adjust the path to your Firebase config

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL parameter is missing." });
  }

  try {
    const imageRef = ref(storage, imageUrl);
    const downloadUrl = await getDownloadURL(imageRef);

    // Fetch the image data from the Firebase download URL
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      console.error("Error fetching image from Firebase:", response.status, response.statusText);
      return res.status(response.status).json({ error: "Failed to fetch image from Firebase." });
    }
    const buffer = await response.arrayBuffer();

    // Determine the content type (you might need to infer this more robustly)
    const contentType = response.headers.get('Content-Type') || 'image/png';

    // Send the image data back to the client with the correct content type
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Error downloading image from Firebase:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}