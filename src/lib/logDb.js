import mongoose from "mongoose";
import { dbConnect } from "./db";
import { AppLogSchema } from "../models/appLogSchema";

// Logs can live in a dedicated shared DB (same cluster) via LOG_MONGO_URI.
// If not set (or equal to MONGO_URI), the app's normal DB is used.
const configuredUri = String(process.env.LOG_MONGO_URI || "").trim();
const usesSharedLogDb = !!configuredUri && configuredUri !== process.env.MONGO_URI;

let sharedConn = null;
let readyPromise = null;

function connectShared() {
  if (readyPromise) return readyPromise;
  sharedConn = mongoose.createConnection(configuredUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });
  sharedConn.on("error", (err) =>
    console.error("[logDb] shared connection error:", err.message),
  );
  readyPromise = new Promise((resolve, reject) => {
    sharedConn.once("open", () => resolve(sharedConn));
    sharedConn.once("error", (err) => {
      readyPromise = null;
      reject(err);
    });
  });
  readyPromise.catch(() => {});
  return readyPromise;
}

export async function getLogConnection() {
  if (usesSharedLogDb) return connectShared();
  await dbConnect();
  return mongoose.connection;
}

export async function getAppLogModel() {
  const conn = await getLogConnection();
  if (conn.models && conn.models.AppLog) return conn.models.AppLog;
  return conn.model("AppLog", AppLogSchema.clone());
}

export default { getLogConnection, getAppLogModel };
