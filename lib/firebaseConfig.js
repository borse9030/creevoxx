// lib/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("your_") &&
  !firebaseConfig.projectId.includes("your_")
);

export let app = null;
export let db = null;
export let auth = null;
export let analytics = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Analytics on the client side only if supported
    if (typeof window !== "undefined") {
      isSupported()
        .then((supported) => {
          if (supported) analytics = getAnalytics(app);
        })
        .catch(() => {});
    }
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "%c[Creevoxx] Firebase not configured — running in DEMO MODE.\n" +
        "Copy .env.local.example → .env.local and fill in your credentials.",
      "color: #f59e0b; font-weight: bold;"
    );
  }
}

export function getFirebaseInstances() {
  return { db, auth };
}

export default getFirebaseInstances;
