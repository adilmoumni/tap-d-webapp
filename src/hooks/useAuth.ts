"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { onAuthChange, getUserProfile } from "@/lib/auth";
import type { UserProfile } from "@/types";

/* ------------------------------------------------------------------
   useAuth – subscribes to Firebase auth state.
   Returns { user, profile, loading, error }.
   • user:    raw Firebase User object (or null)
   • profile: Firestore UserProfile document (or null)
   • loading: true until the first auth state emission
------------------------------------------------------------------ */

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          const p = await getUserProfile(firebaseUser.uid);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Auth error"));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, error };
}
