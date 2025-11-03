export default async function handler(req, res) {
  // Set the appropriate headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  // Optional: Disable compression (if needed)
  // res.setHeader('Content-Encoding', 'identity');

  let count = 0;
  const intervalId = setInterval(() => {
    count++;
    // Construct the SSE message
    const data = `data: ${JSON.stringify({ count })}\n\n`; // Double newline is crucial

    // Send the data to the client
    res.write(data);

    // Check if the client has disconnected
    if (res.closed) {
      clearInterval(intervalId);
      console.log("Client disconnected, cleaning up interval");
    }
  }, 1000); // Send an update every second

  // Keep the connection open
  req.on("close", () => {
    clearInterval(intervalId);
    console.log("Client connection closed");
  });

  // Send an initial event to tell the client that the connection is open
  res.write(`data: ${JSON.stringify({ message: "Connected!" })}\n\n`);
}
