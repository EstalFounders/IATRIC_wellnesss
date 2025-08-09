import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBpFcwFNddgm-R_JsrytjwwsZTpBQHbCv8",
  authDomain: "iatrichealthcare-998f5.firebaseapp.com",
  projectId: "iatrichealthcare-998f5",
  storageBucket: "iatrichealthcare-998f5.appspot.com",
  messagingSenderId: "555969311948",
  appId: "1:555969311948:web:f2e0a779c9134461aebe69",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally initialize messaging only on the client side
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

const storage = getStorage(app);

export { storage, messaging, getToken, onMessage };
