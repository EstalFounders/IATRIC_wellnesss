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

// Messaging is only usable where web push is supported (desktop browsers, installed
// PWAs). On iOS Safari / in-app webviews `isSupported()` resolves false, so callers must
// skip messaging entirely - never call onMessage/getToken with a null instance.
let messagingInstance = null;
let messagingPromise = null;

export const getMessagingIfSupported = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (messagingInstance) return Promise.resolve(messagingInstance);

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => {
        if (!supported || !("serviceWorker" in navigator)) {
          console.warn(
            "Firebase Messaging is not supported in this environment (e.g. iOS Safari / Instagram Webview)."
          );
          return null;
        }
        messagingInstance = getMessaging(app);
        return messagingInstance;
      })
      .catch((err) => {
        console.error("Error checking Firebase Messaging support:", err);
        return null;
      });
  }

  return messagingPromise;
};

export { storage, getToken, onMessage };
