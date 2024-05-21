// import ZoomMtg from "@zoom/videosdk";

import ZoomVideo from "@zoom/videosdk";

const sdkConfig = {
  apiKey: process.env.ZOOM_API_KEY,
  apiSecret: process.env.ZOOM_API_SECRET,
};

const zoomClient = ZoomVideo.createClient(sdkConfig)

export default zoomClient;
