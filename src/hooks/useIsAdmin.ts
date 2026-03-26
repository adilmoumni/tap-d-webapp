"use client";

import { useAuth } from "@/hooks/useAuth";

/**
 * Returns true when the currently signed-in user has role === "admin"
 * in their Firestore `users/{uid}` document.
 *
 * To grant admin:  set `role: "admin"` on the user doc in Firestore console.
 * All other users (including missing role) default to non-admin.
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { profile, loading } = useAuth();
  return {
    isAdmin: profile?.role === "admin",
    loading,
  };
}
