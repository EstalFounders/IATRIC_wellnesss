/**
 * WebSocket Utility for AWS API Gateway WebSocket connections
 *
 * Provides helpers to:
 * 1. Track WebSocket connections in DynamoDB
 * 2. Send messages back through API Gateway to connected clients
 * 3. Query/broadcast to connections in a meeting room
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "WebSocketConnections";

let docClient = null;

function getDocClient() {
  if (!docClient) {
    const client = new DynamoDBClient({ region: REGION });
    docClient = DynamoDBDocumentClient.from(client);
  }
  return docClient;
}

/**
 * Initialize API Gateway Management API client for posting back to connections
 */
export function getApiGateway(domainName, stage) {
  const endpoint = `https://${domainName}/${stage}`;
  return new ApiGatewayManagementApiClient({ region: REGION, endpoint });
}

/**
 * Save a new WebSocket connection to DynamoDB
 */
export async function saveConnection(connectionId, meetingId, role, userData) {
  const client = getDocClient();
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours TTL

  await client.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      connectionId,
      meetingId,
      role,
      userData: userData || {},
      joinedAt: timestamp,
      ttl,
      isVideoOn: false,
      isAudioOn: false,
      isHandRaised: false,
    },
  }));
  console.log(`Saved connection ${connectionId} for meeting ${meetingId} as ${role}`);
}

/**
 * Remove a connection from DynamoDB
 */
export async function removeConnection(connectionId) {
  const client = getDocClient();
  await client.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { connectionId },
  }));
  console.log(`Removed connection ${connectionId}`);
}

/**
 * Get all connections in a meeting room by scanning for matching meetingId
 */
export async function getConnectionsInRoom(meetingId) {
  const client = getDocClient();
  const result = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "meetingId = :meetingId",
    ExpressionAttributeValues: {
      ":meetingId": meetingId,
    },
  }));
  return result.Items || [];
}

/**
 * Send a message to a specific WebSocket connection via API Gateway
 */
export async function sendToConnection(apiGatewayClient, connectionId, action, data) {
  try {
    const payload = JSON.stringify({ action, ...data });
    await apiGatewayClient.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: new TextEncoder().encode(payload),
    }));
  } catch (err) {
    if (err.name === "GoneException") {
      console.log(`Connection ${connectionId} is gone, removing`);
      await removeConnection(connectionId);
    } else {
      console.error(`Error sending to connection ${connectionId}:`, err.message);
    }
  }
}

/**
 * Broadcast a message to all connections in a room, optionally excluding one
 */
export async function broadcastToRoom(apiGatewayClient, meetingId, action, data, excludeConnectionId) {
  const connections = await getConnectionsInRoom(meetingId);
  const promises = connections
    .filter((conn) => conn.connectionId !== excludeConnectionId)
    .map((conn) => sendToConnection(apiGatewayClient, conn.connectionId, action, data));
  await Promise.allSettled(promises);
}

/**
 * Get a serializable list of participants from connection items
 */
export function getParticipantsList(connections) {
  return connections.map((conn) => ({
    connectionId: conn.connectionId,
    role: conn.role,
    userData: conn.userData || {},
    joinedAt: conn.joinedAt,
    isVideoOn: conn.isVideoOn || false,
    isAudioOn: conn.isAudioOn || false,
    isHandRaised: conn.isHandRaised || false,
  }));
}

/**
 * Update connection metadata fields in DynamoDB
 */
export async function updateConnectionMeta(connectionId, updates) {
  const client = getDocClient();
  const keys = Object.keys(updates);
  if (keys.length === 0) return;
  const updateExpr = "SET " + keys.map((k) => `#${k} = :${k}`).join(", ");
  const attrNames = {};
  const attrValues = {};
  keys.forEach((k) => {
    attrNames[`#${k}`] = k;
    attrValues[`:${k}`] = updates[k];
  });

  await client.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { connectionId },
    UpdateExpression: updateExpr,
    ExpressionAttributeNames: attrNames,
    ExpressionAttributeValues: attrValues,
  }));
}