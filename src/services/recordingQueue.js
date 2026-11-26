// src/services/recordingQueue.js
//
// Durable holding pen for consultation recordings.
//
// The meeting room records for the whole call, so the finished blob can be tens
// of megabytes and the upload can outlive the tab: a doctor ends the call and
// closes the browser a few seconds later, which used to abort the Firebase
// upload and leave no recording at all. The blob is now kept in IndexedDB on the
// doctor's machine until `saveRecordingUrl` has accepted its URL, so an
// interrupted upload is retried the next time the room opens.
//
// Plain IndexedDB on purpose - no dependency, and every helper rejects (never
// throws synchronously) so a browser that blocks storage can only cost the retry
// copy, never the call itself.

const DB_NAME = "healthpath-recordings";
const DB_VERSION = 1;
const STORE = "pending";

const isSupported = () =>
  typeof window !== "undefined" && typeof window.indexedDB !== "undefined";

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(new Error("IndexedDB is not available in this browser"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "key" });
        store.createIndex("meetingId", "meetingId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });

const withStore = async (mode, run) => {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
};

/**
 * Keep a finished recording on this device until its download URL is stored on
 * the appointment.
 *
 * @param {{ key: string, meetingId?: string, appointmentId?: string, blob: Blob }} entry
 * @returns {Promise<void>}
 */
export const putPendingRecording = ({ key, meetingId, appointmentId, blob }) =>
  withStore("readwrite", (store) =>
    store.put({
      key,
      meetingId: meetingId || "",
      appointmentId: appointmentId || "",
      blob,
      mimeType: blob?.type || "",
      bytes: blob?.size || 0,
      createdAt: Date.now(),
    })
  ).then(() => undefined);

/**
 * Every recording still waiting for an upload, newest last.
 *
 * @param {string} [meetingId] restrict to one meeting (the room only ever cares
 *   about its own recordings, so a patient's browser never touches a doctor's)
 * @returns {Promise<Array<{ key: string, meetingId: string, appointmentId: string, blob: Blob }>>}
 */
export const getPendingRecordings = async (meetingId) => {
  try {
    const all = (await withStore("readonly", (store) => store.getAll())) || [];
    const rows = meetingId ? all.filter((row) => row.meetingId === meetingId) : all;
    return rows.filter((row) => row.blob && row.blob.size > 0);
  } catch (error) {
    // A private window, a cleared profile or a blocked quota - nothing to resume.
    return [];
  }
};

/**
 * Drop a recording once its URL is on the appointment.
 *
 * @param {string} key
 * @returns {Promise<void>}
 */
export const deletePendingRecording = (key) =>
  key ? withStore("readwrite", (store) => store.delete(key)).then(() => undefined) : Promise.resolve();
