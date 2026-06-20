import { dbConnect } from '../../../src/lib/db';
import Notification from '../../../src/models/NotificationSchema';
import { logErrorToGoogleSheet } from '../helper';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "notification - GET",
        errorMessage: error.message || "Failed to fetch notifications",
        errorCode: "500",
        stackTrace: error.stack,
      });
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  } else if (req.method === 'PUT') {
    const { id, read } = req.body;
    try {
      const updatedNotification = await Notification.findByIdAndUpdate(id, { read }, { new: true });
      res.status(200).json(updatedNotification);
    } catch (error) {
      await logErrorToGoogleSheet({
        apiName: "notification - PUT",
        errorMessage: error.message || "Failed to update notification",
        errorCode: "500",
        stackTrace: error.stack,
        requestPayload: { id, read },
      });
      res.status(500).json({ error: 'Failed to update notification' });
    }
  } else {
    res.status(405).end();
  }
}