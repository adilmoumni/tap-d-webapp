"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToUserBio, upsertBioPage } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { BioPage } from "@/types";

/* ------------------------------------------------------------------
   useBio — real-time subscription to the current user's bio page.
   Returns { bio, loading, error } plus update helper.
------------------------------------------------------------------ */

interface UseBioReturn {
  bio: BioPage | null;
  loading: boolean;
  error: Error | null;
  saveBio: (data: Partial<Omit<BioPage, "id" | "uid" | "createdAt">>) => Promise<void>;
}

export function useBio(): UseBioReturn {
  const { user } = useAuth();
  const [bio, setBio]       = useState<BioPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setBio(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToUserBio(user.uid, (data) => {
      setBio(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const saveBio = useCallback(
    async (data: Partial<Omit<BioPage, "id" | "uid" | "createdAt">>) => {
      if (!user) throw new Error("Not authenticated");
      try {
        await upsertBioPage(user.uid, data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to save bio page"));
        throw err;
      }
    },
    [user]
  );

  return { bio, loading, error, saveBio };
}
