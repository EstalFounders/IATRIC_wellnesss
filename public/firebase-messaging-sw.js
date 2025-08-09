/* eslint-disable no-undef */
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

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
