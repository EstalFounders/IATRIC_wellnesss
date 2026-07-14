import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBpFcwFNddgm-R_JsrytjwwsZTpBQHbCv8",
  authDomain: "iatrichealthcare-998f5.firebaseapp.com",
  projectId: "iatrichealthcare-998f5",
  storageBucket: "iatrichealthcare-998f5.appspot.com",
  messagingSenderId: "555969311948",
  appId: "1:555969311948:web:f2e0a779c9134461aebe69",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage
const storage = getStorage(app);

// Safe messaging initialization placeholder
let messaging = null;

// Only initialize messaging if we are on the client-side AND the browser supports it
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported && "serviceWorker" in navigator) {
        messaging = getMessaging(app);
      } else {
        console.warn("Firebase Messaging is not supported in this environment (e.g., Instagram Webview).");
      }
    })
    .catch((err) => {
      console.error("Error checking Firebase Messaging support:", err);
    });
}

export { storage, messaging, getToken, onMessage };