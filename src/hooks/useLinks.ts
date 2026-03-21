"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToUserLinks, createLink, updateLink, deleteLink } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { SmartLink } from "@/types";

/* ------------------------------------------------------------------
   useLinks — real-time subscription to the current user's links.
   Returns { links, loading, error } plus CRUD helpers.
------------------------------------------------------------------ */

interface UseLinksReturn {
  links: SmartLink[];
  loading: boolean;
  error: Error | null;
  create: (data: Omit<SmartLink, "id" | "uid" | "clickCount" | "createdAt" | "updatedAt">) => Promise<string>;
  update: (id: string, data: Partial<Omit<SmartLink, "id" | "uid" | "createdAt">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useLinks(): UseLinksReturn {
  const { user } = useAuth();
  const [links, setLinks]   = useState<SmartLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToUserLinks(user.uid, (data) => {
      setLinks(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const create = useCallback(
    async (data: Omit<SmartLink, "id" | "uid" | "clickCount" | "createdAt" | "updatedAt">) => {
      if (!user) throw new Error("Not authenticated");
      try {
        return await createLink(user.uid, data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to create link"));
        throw err;
      }
    },
    [user]
  );

  const update = useCallback(
    async (id: string, data: Partial<Omit<SmartLink, "id" | "uid" | "createdAt">>) => {
      try {
        await updateLink(id, data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update link"));
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      await deleteLink(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete link"));
      throw err;
    }
  }, []);

  return { links, loading, error, create, update, remove };
}
