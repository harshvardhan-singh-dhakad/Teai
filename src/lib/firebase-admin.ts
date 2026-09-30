import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "teai-ai-voice-agent-platform";
const app = getApps().find(existing => existing.name === "teai-admin") ??
  initializeApp({ credential: applicationDefault(), projectId }, "teai-admin");

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
