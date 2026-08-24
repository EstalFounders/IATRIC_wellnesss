import admin from "../../../lib/firebaseAdmin";

/**
 * Sends a push notification to the main admin.
 *
 * The admin FCM token is stored in a Firestore collection ("adminTokens").
 * However, this project's Google Cloud database is in Datastore Mode, where
 * `admin.firestore()` (Native Firestore API) is NOT available. Reading the
 * token then fails with:
 *
 *   "The Cloud Firestore API is not available for Firestore in Datastore Mode"
 *
 * This function is intentionally resilient: any Firestore/FCM failure is
 * logged and swallowed so it can NEVER break the caller (e.g. booking flow
 * or payment confirmation). FCM admin alerts degrade gracefully until
 * Native Firestore mode is enabled / the token is moved to MongoDB.
 */
export async function sendAdminNotification({ title, body }) {
  try {
    let tokenDoc;
    try {
      tokenDoc = await admin
        .firestore()
        .collection("adminTokens")
        .doc("main-admin")
        .get();
    } catch (firestoreErr) {
      console.warn(
        "sendAdminNotification: Firestore unavailable (Datastore Mode?), skipping admin push:",
        firestoreErr.message,
      );
      return;
    }

    const adminToken = tokenDoc?.data()?.token;
    if (!adminToken) {
      console.warn("sendAdminNotification: No admin token found, skipping.");
      return;
    }

    try {
      await admin.messaging().send({
        token: adminToken,
        notification: { title, body },
      });
    } catch (messagingErr) {
      console.error(
        "sendAdminNotification: FCM send failed (logged, not thrown):",
        messagingErr.message,
      );
    }
  } catch (err) {
    // Absolute last-resort guard - never propagate to the booking/payment flow
    console.error(
      "sendAdminNotification: unexpected error (logged, not thrown):",
      err.message,
    );
  }
}