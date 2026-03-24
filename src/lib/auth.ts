/* ------------------------------------------------------------------
   Auth helpers — all Firebase Auth operations live here.
   Components call these, never Firebase Auth methods directly.
------------------------------------------------------------------ */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { createBioPage } from "@/lib/db/bio";
import type { UserProfile } from "@/types";
import {
  generateUniquePublicSlug,
  isPublicSlugAvailable,
  isValidPublicSlug,
  normalizePublicSlug,
} from "@/lib/slug";

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

/* ---- Email/Password Sign-In ---- */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error("[tap-d] Email Sign-In Error:", error.code, error.message);
    throw error;
  }
}

/* ---- Email/Password Sign-Up ---- */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  desiredSlug: string
): Promise<User> {
  try {
    const normalizedSlug = normalizePublicSlug(desiredSlug);
    if (!isValidPublicSlug(normalizedSlug)) {
      throw new Error("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
    }

    const available = await isPublicSlugAvailable(normalizedSlug);
    if (!available) {
      throw new Error("This slug is already taken.");
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set the user's name on the Firebase Auth object
    await updateProfile(result.user, { displayName });
    
    try {
      // Create the Firestore profile with the chosen slug
      await createUserProfile(result.user, {
        preferredSlug: normalizedSlug,
        requirePreferredSlug: true,
      });
    } catch (profileErr) {
      try {
        await result.user.delete();
      } catch {
        // Ignore rollback failure and surface the original error.
      }
      throw profileErr;
    }
    return result.user;
  } catch (error: any) {
    console.error("[tap-d] Email Sign-Up Error:", error.code, error.message ?? error);
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
export async function createUserProfile(
  user: User,
  opts?: { preferredSlug?: string; requirePreferredSlug?: boolean }
): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);
  const mutableFields = {
    displayName: user.displayName,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
  };

  if (!snapshot.exists()) {
    let selectedSlug = "";

    if (opts?.preferredSlug) {
      const preferred = normalizePublicSlug(opts.preferredSlug);
      if (!isValidPublicSlug(preferred)) {
        throw new Error("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
      }

      const available = await isPublicSlugAvailable(preferred);
      if (!available) {
        if (opts.requirePreferredSlug) {
          throw new Error("This slug is already taken.");
        }
      } else {
        selectedSlug = preferred;
      }
    }

    if (!selectedSlug) {
      selectedSlug = await generateUniquePublicSlug(user.displayName ?? "user");
    }

    const newBioId = await createBioPage(user.uid, selectedSlug, {
        displayName: user.displayName || selectedSlug,
        avatarUrl: user.photoURL ?? null,
    });

    // First sign-in: create the profile
    const profile = {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      username:    selectedSlug,
      activeBioId: newBioId,
      plan:        "free",
      createdAt:   serverTimestamp() as UserProfile["createdAt"],
      updatedAt:   serverTimestamp(),
    };
    await setDoc(ref, profile);
  } else {
    const existing = snapshot.data() as Partial<UserProfile>;
    let username = typeof existing.username === "string" ? existing.username.trim() : "";
    let activeBioId = typeof existing.activeBioId === "string" && existing.activeBioId ? existing.activeBioId : null;

    // Self-heal legacy users with missing slug.
    if (!username) {
      username = await generateUniquePublicSlug(user.displayName ?? "user");
      activeBioId = await createBioPage(user.uid, username, {
        displayName: user.displayName || username,
        avatarUrl: user.photoURL ?? null,
      });
    }

    // Self-heal missing activeBioId.
    if (!activeBioId && username) {
      const bySlug = await getDocs(query(collection(db, "biopages"), where("slug", "==", username), limit(1)));
      if (!bySlug.empty && bySlug.docs[0].data()?.ownerId === user.uid) {
        activeBioId = bySlug.docs[0].id;
      } else {
        const available = await isPublicSlugAvailable(username, { excludeUid: user.uid });
        if (!available) {
          username = await generateUniquePublicSlug(user.displayName ?? "user");
        }
        activeBioId = await createBioPage(user.uid, username, {
          displayName: user.displayName || username,
          avatarUrl: user.photoURL ?? null,
        });
      }
    }

    await setDoc(
      ref,
      {
        ...mutableFields,
        username,
        activeBioId,
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

// Avoid concurrent profile-repair runs for the same user when multiple components mount.
const ensureProfileInFlight = new Map<string, Promise<void>>();

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  let inFlight = ensureProfileInFlight.get(user.uid);
  if (!inFlight) {
    inFlight = createUserProfile(user)
      .catch((err) => {
        console.error("[tap-d] ensureUserProfile failed:", err);
        throw err;
      })
      .finally(() => {
        ensureProfileInFlight.delete(user.uid);
      });
    ensureProfileInFlight.set(user.uid, inFlight);
  }

  await inFlight;
  return getUserProfile(user.uid);
}
