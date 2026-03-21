/* ------------------------------------------------------------------
   Auth helpers — all Firebase Auth operations live here.
   Components call these, never Firebase Auth methods directly.
------------------------------------------------------------------ */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

/* ---- Google Sign-In ---- */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error("[tap-d] Google Sign-In Error:", error.code, error.message);
    throw error;
  }
}

/* ---- Sign Out ---- */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/* ---- Auth State Listener ---- */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/* ---- Create/merge user profile in Firestore ---- */
export async function createUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    // First sign-in: create the profile
    const profile: Omit<UserProfile, "id"> = {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      username:    null,
      plan:        "free",
      createdAt:   serverTimestamp() as UserProfile["createdAt"],
    };
    await setDoc(ref, profile);
  } else {
    // Subsequent sign-ins: update mutable fields
    await setDoc(
      ref,
      {
        displayName: user.displayName,
        photoURL:    user.photoURL,
        updatedAt:   serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/* ---- Fetch user profile from Firestore ---- */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { uid, ...snapshot.data() } as UserProfile;
}
