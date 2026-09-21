/* eslint-disable no-undef */
// v2 - guarded registration: firebase.messaging() is null/unavailable where web push
// is unsupported (iOS Safari, in-app webviews, non-secure contexts).
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBpFcwFNddgm-R_JsrytjwwsZTpBQHbCv8",
  authDomain: "iatrichealthcare-998f5.firebaseapp.com",
  projectId: "iatrichealthcare-998f5",
  storageBucket: "iatrichealthcare-998f5.appspot.com",
  messagingSenderId: "555969311948",
  appId: "1:555969311948:web:f2e0a779c9134461aebe69",
});

const supported =
  typeof firebase.messaging.isSupported === "function"
    ? firebase.messaging.isSupported()
    : Promise.resolve(true);

supported
  .then((isSupported) => {
    if (!isSupported) {
      console.warn(
        "[firebase-messaging-sw] Web push is not supported; background messages disabled."
      );
      return null;
    }

    const messaging = firebase.messaging();
    if (!messaging) return null;

    messaging.onBackgroundMessage(function (payload) {
      const notification = (payload && payload.notification) || {};
      const data = (payload && payload.data) || {};
      const notificationTitle = notification.title || data.title;

      // Data-only payloads without a title have nothing to display.
      if (!notificationTitle) return;

      self.registration.showNotification(notificationTitle, {
        body: notification.body || data.body || "",
        icon: data.icon || "/firebase-logo.png",
      });
    });

    return messaging;
  })
  .catch((err) => {
    console.warn(
      "[firebase-messaging-sw] messaging unavailable:",
      err && err.message
    );
  });
