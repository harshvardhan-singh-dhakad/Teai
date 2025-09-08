// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "teai-ai-voice-agent-platform",
  "appId": "1:1073212603999:web:bc5be28ddd10f17b4765ea",
  "storageBucket": "teai-ai-voice-agent-platform.firebasestorage.app",
  "apiKey": "AIzaSyBF8xtOwRTveOuwkNXaED0QXJCXbNT0rTk",
  "authDomain": "teai-ai-voice-agent-platform.firebaseapp.com",
  "messagingSenderId": "1073212603999"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
