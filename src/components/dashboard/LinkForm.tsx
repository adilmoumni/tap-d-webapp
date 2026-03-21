"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLinks } from "@/hooks/useLinks";
import { checkSlugAvailable } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { SmartLink } from "@/types";

/* ------------------------------------------------------------------
   LinkForm — create or edit a SmartLink.
   Pass `initial` to pre-fill for editing. Omit for create mode.
------------------------------------------------------------------ */

interface LinkFormProps {
  initial?: SmartLink;
}

export function LinkForm({ initial }: LinkFormProps) {
  const router = useRouter();
  const { create, update } = useLinks();
  const isEdit = Boolean(initial);

  const [title,       setTitle]       = useState(initial?.title ?? "");
  const [slug,        setSlug]        = useState(initial?.slug ?? "");
  const [urlDesktop,  setUrlDesktop]  = useState(initial?.urlDesktop ?? "");
  const [urlIOS,      setUrlIOS]      = useState(initial?.urlIOS ?? "");
  const [urlAndroid,  setUrlAndroid]  = useState(initial?.urlAndroid ?? "");
  const [isSmart,     setIsSmart]     = useState(initial?.isSmart ?? false);
  const [active,      setActive]      = useState(initial?.active ?? true);

  const [slugStatus,  setSlugStatus]  = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Auto-generate slug from title (create mode only)
  useEffect(() => {
    if (isEdit || !title) return;
    const auto = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);
    setSlug(auto);
  }, [title, isEdit]);

  // Slug availability check
  const checkSlug = useCallback(async (s: string) => {
    if (!s || (isEdit && s === initial?.slug)) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    try {
      const available = await checkSlugAvailable(s, initial?.id);
      setSlugStatus(available ? "available" : "taken");
    } catch {
      setSlugStatus("idle");
    }
  }, [isEdit, initial?.slug, initial?.id]);

  useEffect(() => {
    const t = setTimeout(() => checkSlug(slug), 500);
    return () => clearTimeout(t);
  }, [slug, checkSlug]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !slug || !urlDesktop) return;
    if (slugStatus === "taken") { setError("That slug is already taken."); return; }

    setSaving(true);
    setError(null);
    try {
      const data = {
        title,
        slug,
        urlDesktop,
        ...(isSmart && urlIOS     ? { urlIOS }     : {}),
        ...(isSmart && urlAndroid ? { urlAndroid }  : {}),
        isSmart,
        active,
      };
      if (isEdit && initial) {
        await update(initial.id, data);
        router.push(`/d/links/${slug}`);
      } else {
        await create(data);
        router.push("/d/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const slugHint =
    slugStatus === "checking"  ? "Checking…"   :
    slugStatus === "available" ? "Available ✓" :
    slugStatus === "taken"     ? "Already taken" :
    null;

  const slugHintColor =
    slugStatus === "available" ? "text-success" :
    slugStatus === "taken"     ? "text-error"   :
    "text-text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My App Store Link"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Short Link
        </label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          prefix="tap-d.link/"
          placeholder="my-app"
          required
          mono
        />
        {slugHint && (
          <p className={cn("mt-1 text-xs", slugHintColor)}>{slugHint}</p>
        )}
      </div>

      {/* Desktop / Fallback URL */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Desktop URL <span className="text-text-muted font-normal">(required fallback)</span>
        </label>
        <Input
          type="url"
          value={urlDesktop}
          onChange={(e) => setUrlDesktop(e.target.value)}
          placeholder="https://example.com"
          required
          mono
        />
      </div>

      {/* Smart link toggle */}
      <div className="flex items-center justify-between p-4 bg-lavender-light rounded-xl">
        <div>
          <p className="text-sm font-semibold text-text-primary">Smart Link</p>
          <p className="text-xs text-text-muted mt-0.5">
            Route iOS and Android to different destinations
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsSmart((v) => !v)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200",
            isSmart ? "bg-dark" : "bg-border-strong"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
              isSmart && "translate-x-5"
            )}
          />
        </button>
      </div>

      {/* Platform URLs (smart mode only) */}
      {isSmart && (
        <div className="space-y-4 pl-4 border-l-2 border-lavender">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              iOS URL <span className="text-text-muted font-normal">(App Store)</span>
            </label>
            <Input
              type="url"
              value={urlIOS}
              onChange={(e) => setUrlIOS(e.target.value)}
              placeholder="https://apps.apple.com/…"
              mono
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Android URL <span className="text-text-muted font-normal">(Play Store)</span>
            </label>
            <Input
              type="url"
              value={urlAndroid}
              onChange={(e) => setUrlAndroid(e.target.value)}
              placeholder="https://play.google.com/…"
              mono
            />
          </div>
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="w-4 h-4 accent-dark rounded"
        />
        <label htmlFor="active" className="text-sm text-text-secondary cursor-pointer">
          Link is active (receives traffic)
        </label>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={saving} full>
          {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Link")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
