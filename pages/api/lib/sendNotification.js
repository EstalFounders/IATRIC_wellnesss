import admin from "../../../lib/firebaseAdmin";

export async function sendAdminNotification({ title, body }) {
  const tokenDoc = await admin.firestore().collection("adminTokens").doc("main-admin").get();
  const adminToken = tokenDoc.data()?.token;

  if (!adminToken) throw new Error("No admin token found");

  return await admin.messaging().send({
    token: adminToken,
    notification: { title, body },
  });
}
