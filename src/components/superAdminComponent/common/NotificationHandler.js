import React, { useEffect, useState } from "react";
import {
  getToken,
  onMessage,
  getMessagingIfSupported,
} from "../../../../lib/firebase";
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

const NotificationHandler = ({ onNotification }) => {
  const [permission, setPermission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // The Notification API does not exist in some mobile browsers (e.g. iOS Safari tabs).
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      console.warn("[NotificationHandler] Notifications are not supported here.");
      return undefined;
    }

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
        const messaging = await getMessagingIfSupported();
        if (!messaging) {
          console.warn(
            "[NotificationHandler] Firebase Messaging is not supported in this browser."
          );
          return;
        }

        const token = await getToken(messaging, { vapidKey: vapidKeyImported });
        console.log("FCM Token:", token);
        // Save token to your backend or database if needed
      } catch (error) {
        console.error("FCM Token error:", error);
      }
    };

    checkNotificationPermission();

    // Listen for foreground messages - skipped when web push is unsupported.
    let unsubscribe;
    let cancelled = false;

    (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging || cancelled) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("Message received in foreground:", payload);
        const notification = payload?.notification || {};
        const data = payload?.data || {};
        if (onNotification) {
          onNotification(notification);
        }
        alert(
          `${notification.title || data.title || "Notification"}: ${
            notification.body || data.body || ""
          }`
        );
      });
    })();

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
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
