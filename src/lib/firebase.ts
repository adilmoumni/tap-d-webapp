/* ------------------------------------------------------------------
   Firebase App Initialization — singleton, gracefully degraded.

   When NEXT_PUBLIC_FIREBASE_API_KEY is not set (e.g. before .env.local
   is configured) we skip initializeApp entirely and export null stubs.
   This prevents the auth/invalid-api-key crash on module evaluation.

   Check `isFirebaseReady` before calling any auth or DB operation.
------------------------------------------------------------------ */

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

const apiKey     = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId  = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const isFirebaseReady = Boolean(apiKey && authDomain && projectId);

// Lazy-initialized singletons ─ only created when env vars are present
let _app:     FirebaseApp     | null = null;
let _auth:    Auth            | null = null;
let _db:      Firestore       | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseReady) {
  // Dynamic require keeps these imports tree-shakeable in non-firebase routes
  const { initializeApp, getApps, getApp } = require("firebase/app");
  const { getAuth }                         = require("firebase/auth");
  const { getFirestore }                    = require("firebase/firestore");
  const { getStorage }                      = require("firebase/storage");

  _app     = getApps().length ? getApp() : initializeApp({ apiKey, authDomain, projectId,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
  _auth    = getAuth(_app);
  _db      = getFirestore(_app);
  _storage = getStorage(_app);
} else {
  if (typeof window !== "undefined") {
    console.warn(
      "[tap-d] Firebase not initialized — add your keys to .env.local.\n" +
        "See .env.example for the required variables."
    );
  }
}

export const app     = _app;
export const auth    = _auth as Auth;          // callers check isFirebaseReady first
export const db      = _db as Firestore;
export const storage = _storage as FirebaseStorage;
export default _app;

