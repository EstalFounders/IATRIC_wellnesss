import React, { useEffect, useState } from "react";
import { getToken, onMessage } from "../../../../lib/firebase";
import { messaging } from "../../../../lib/firebase"; // Adjust the import to match your Firebase setup
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { vapidKey } from "../../../constant";

const vapidKeyImported = vapidKey; // Replace with your actual Firebase VAPID key

const NotificationHandler = (onNotification) => {
  const [permission, setPermission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      if (currentPermission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
          await getFCMToken();
        } else if (result === "denied") {
          setShowModal(true);
        }
      } else if (currentPermission === "granted") {
        await getFCMToken();
      } else if (currentPermission === "denied") {
        setShowModal(true);
      }
    };

    const getFCMToken = async () => {
      try {
        const token = await getToken(messaging, { vapidKeyImported });
        console.log("FCM Token:", token);
        // Save token to your backend or database if needed
      } catch (error) {
        console.error("FCM Token error:", error);
      }
    };

    checkNotificationPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      if (onNotification) {
        onNotification(payload.notification);
      }
      alert(payload.notification.title + ": " + payload.notification.body);
    });

    return () => unsubscribe();
  }, [onNotification]);

  return (
    <Dialog open={showModal}>
      <DialogTitle>Enable Notifications</DialogTitle>
      <DialogContent>
        <Typography>
          You’ve denied notifications. Please enable them manually from your
          browser settings to receive important alerts like consultation or lab
          bookings.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            window.open("chrome://settings/content/notifications", "_blank");
            setShowModal(false);
          }}
        >
          Go to Settings
        </Button>
        <Button onClick={() => setShowModal(false)} color="error">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationHandler;
