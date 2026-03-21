/* ------------------------------------------------------------------
   Firebase App Initialization — singleton, gracefully degraded.

   When NEXT_PUBLIC_FIREBASE_API_KEY is not set (e.g. before .env.local
   is configured) we skip initializeApp entirely and export null stubs.
   This prevents the auth/invalid-api-key crash on module evaluation.

   Check `isFirebaseReady` before calling any auth or DB operation.
------------------------------------------------------------------ */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseReady = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

let _app:     FirebaseApp     | null = null;
let _auth:    Auth            | null = null;
let _db:      Firestore       | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseReady) {
  try {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _storage = getStorage(_app);
  } catch (error) {
    console.error("[tap-d] Error initializing Firebase:", error);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "[tap-d] Firebase not initialized — add your keys to .env.local.\n" +
      "See .env.example for the required variables."
    );
  }
}

export const app     = _app;
export const auth    = _auth as Auth;
export const db      = _db as Firestore;
export const storage = _storage as FirebaseStorage;
export default _app;

