/**
 * Get WebSocket URL
 *
 * Returns the WebSocket URL that the client should connect to.
 * In production, this would point to your API Gateway WebSocket endpoint.
 * For local development, it returns the configured endpoint or a fallback.
 */

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { meetingId, role } = req.query;

  if (!meetingId || !role) {
    return res.status(400).json({ error: "Missing meetingId or role query parameters" });
  }

  // Get the WebSocket API URL from environment variables
  // In production: wss://your-api-id.execute-api.region.amazonaws.com/production
  // For local dev with API Gateway: use the configured URL
  const wsUrl = process.env.WEBSOCKET_API_URL;

  if (!wsUrl) {
    return res.status(500).json({ error: "WEBSOCKET_API_URL environment variable not configured" });
  }

  // Build the connection URL with query parameters
  const url = `${wsUrl}?meetingId=${encodeURIComponent(meetingId)}&role=${encodeURIComponent(role)}`;

  return res.status(200).json({
    url,
    meetingId,
    role,
  });
}