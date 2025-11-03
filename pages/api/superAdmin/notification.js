import { dbConnect } from "../../../src/lib/db";
import ConsultationFee from "../../../src/models/consultationFeeSchema";
import Notification from "../../../src/models/NotificationSchema";
import ServiceOffered from "../../../src/models/serviceOffered";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const notification = await Notification.find();
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notification" });
    }
  } else if (req.method === "POST") {
    try {
      console.log(req.body, "req body on server");
      const newNotification = new Notification(req.body);
      await newNotification.save();
      res.status(201).json(newNotification);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  } else if (req.method === "PUT") {
    const { id } = req.query;
    console.log(id, "id on server");
    try {
      const notificationService = await Notification.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      res.status(200).json(notificationService);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;
    try {
      await Notification.findByIdAndDelete(id);
      res.status(200).json({ message: "notification deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  } else {
    res.status(405).end();
  }
}
