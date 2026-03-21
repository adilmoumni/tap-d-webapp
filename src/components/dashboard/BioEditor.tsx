"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink, Eye, GripVertical, Plus, X,
  Instagram, Youtube, Twitter, Linkedin, Github, Facebook, Twitch,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BioPhonePreview } from "@/components/dashboard/BioPhonePreview";
import { useBio } from "@/hooks/useBio";
import { useLinks } from "@/hooks/useLinks";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/types";

/* ------------------------------------------------------------------
   Platform definitions
------------------------------------------------------------------ */
type PlatformDef = {
  id: string;
  label: string;
  placeholder: string;
  color: string;
  bg: string;
  // lucide icon component or undefined → use initial
  Icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  initial?: string;
};

const PLATFORMS: PlatformDef[] = [
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/username",  color: "#e1306c", bg: "#fce4ec", Icon: Instagram },
  { id: "tiktok",    label: "TikTok",    placeholder: "https://tiktok.com/@username",    color: "#000",    bg: "#f0f0f0", initial: "T" },
  { id: "youtube",   label: "YouTube",   placeholder: "https://youtube.com/@channel",   color: "#ff0000", bg: "#ffebee", Icon: Youtube },
  { id: "twitter",   label: "X / Twitter", placeholder: "https://x.com/username",      color: "#000",    bg: "#f5f5f5", Icon: Twitter },
  { id: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/in/handle", color: "#0077b5", bg: "#e3f2fd", Icon: Linkedin },
  { id: "github",    label: "GitHub",    placeholder: "https://github.com/username",    color: "#333",    bg: "#f6f8fa", Icon: Github },
  { id: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/username",  color: "#1877f2", bg: "#e3f2fd", Icon: Facebook },
  { id: "twitch",    label: "Twitch",    placeholder: "https://twitch.tv/username",     color: "#9146ff", bg: "#f3e5f5", Icon: Twitch },
  { id: "discord",   label: "Discord",   placeholder: "https://discord.gg/invite",      color: "#5865f2", bg: "#e8eaf6", initial: "D" },
  { id: "telegram",  label: "Telegram",  placeholder: "https://t.me/username",          color: "#0088cc", bg: "#e1f5fe", initial: "TG" },
  { id: "snapchat",  label: "Snapchat",  placeholder: "https://snapchat.com/add/user",  color: "#f5c518", bg: "#fffde7", initial: "SC" },
  { id: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/username", color: "#e60023", bg: "#fce4ec", initial: "P" },
];

function getPlatform(id: string) {
  return PLATFORMS.find((p) => p.id === id);
}

/* ---- Platform icon: small badge used in the editor rows ---- */
function PlatformIcon({ id, size = 16 }: { id: string; size?: number }) {
  const p = getPlatform(id);
  if (!p) return null;
  const boxSize = size + 10;
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
      style={{ width: boxSize, height: boxSize, background: p.bg, color: p.color }}
    >
      {p.Icon ? (
        <p.Icon size={size} style={{ color: p.color }} />
      ) : (
        <span>{p.initial}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Theme definitions
------------------------------------------------------------------ */
const THEMES = [
  { id: "default", label: "Default", dot: "bg-lavender"  },
  { id: "dark",    label: "Dark",    dot: "bg-dark"       },
  { id: "minimal", label: "Minimal", dot: "bg-white border border-border" },
] as const;

type Theme = (typeof THEMES)[number]["id"];

/* ------------------------------------------------------------------
   BioEditor — two-column: edit form (left) + live phone preview (right)
------------------------------------------------------------------ */
export function BioEditor() {
  const { bio, loading: bioLoading, saveBio } = useBio();
  const { links, loading: linksLoading } = useLinks();

  /* ---- Form state ---- */
  const [username,    setUsername]    = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bioText,     setBioText]     = useState("");
  const [theme,       setTheme]       = useState<Theme>("default");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  /* ---- Drag state (for link reordering) ---- */
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  /* Hydrate from Firestore */
  useEffect(() => {
    if (!bio) return;
    setUsername(bio.username       ?? "");
    setDisplayName(bio.displayName ?? "");
    setBioText(bio.bio             ?? "");
    setTheme((bio.theme as Theme)  ?? "default");
    setSelectedIds(bio.linkIds     ?? []);
    setSocialLinks(bio.socialLinks ?? []);
  }, [bio]);

  /* Default: all active links selected when no saved state */
  useEffect(() => {
    if (bio || linksLoading || selectedIds.length > 0) return;
    setSelectedIds(links.filter((l) => l.active).map((l) => l.id));
  }, [bio, links, linksLoading, selectedIds.length]);

  /* ================================================================
     Social link handlers
     ================================================================ */
  const addSocial = (platformId: string) => {
    if (socialLinks.find((sl) => sl.platform === platformId)) return;
    setSocialLinks((prev) => [...prev, { platform: platformId, url: "" }]);
  };

  const removeSocial = (platformId: string) => {
    setSocialLinks((prev) => prev.filter((sl) => sl.platform !== platformId));
  };

  const updateSocialUrl = (platformId: string, url: string) => {
    setSocialLinks((prev) =>
      prev.map((sl) => (sl.platform === platformId ? { ...sl, url } : sl))
    );
  };

  /* ================================================================
     Link ordering handlers
     ================================================================ */
  const addLink = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeLink = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  /* HTML5 drag-to-reorder */
  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
    setDragIdx(targetIdx);
  };

  const handleDragEnd = () => setDragIdx(null);

  /* ================================================================
     Save
     ================================================================ */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !displayName) return;
    setSaving(true);
    setError(null);
    try {
      await saveBio({
        username,
        displayName,
        bio: bioText,
        theme,
        linkIds: selectedIds,
        socialLinks,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = username
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/@${username}`
    : null;

  /* ---- Active / inactive link split ---- */
  const activeLinks = selectedIds
    .map((id) => links.find((l) => l.id === id))
    .filter(Boolean) as typeof links;

  const inactiveLinks = links.filter((l) => !selectedIds.includes(l.id));

  /* ---- Platforms not yet added ---- */
  const availablePlatforms = PLATFORMS.filter(
    (p) => !socialLinks.find((sl) => sl.platform === p.id)
  );

  if (bioLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-lavender-light rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
      {/* ================================================================
          Left: Form
          ================================================================ */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Username</label>
          <Input
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
            }
            prefix="tap-d.link/@"
            placeholder="yourname"
            mono
            required
          />
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 flex items-center gap-1 text-xs text-text-muted hover:text-lavender-dark transition-colors w-fit"
            >
              <Eye size={11} />
              Preview live page
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your Name"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Bio</label>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="A short description about you…"
            rows={3}
            maxLength={200}
            className={cn(
              "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5",
              "text-sm text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:border-lavender focus:ring-2 focus:ring-lavender/30",
              "resize-none transition-all duration-200"
            )}
          />
          <p className="text-xs text-text-muted text-right mt-0.5">{bioText.length}/200</p>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Theme</label>
          <div className="flex gap-2">
            {THEMES.map(({ id, label, dot }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 flex flex-col items-center gap-1.5",
                  theme === id
                    ? "border-lavender bg-lavender-light text-text-primary"
                    : "border-border bg-surface text-text-secondary hover:bg-surface-muted"
                )}
              >
                <span className={cn("w-5 h-5 rounded-full", dot)} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================
            Social Links
            ================================================================ */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Social Links
          </label>

          {/* Active social links */}
          {socialLinks.length > 0 && (
            <div className="space-y-2 mb-3">
              {socialLinks.map((sl) => {
                const p = getPlatform(sl.platform);
                return (
                  <div
                    key={sl.platform}
                    className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-xl bg-surface"
                  >
                    <PlatformIcon id={sl.platform} size={14} />
                    <span className="text-xs font-semibold text-text-secondary w-20 flex-shrink-0">
                      {p?.label}
                    </span>
                    <input
                      type="url"
                      value={sl.url}
                      onChange={(e) => updateSocialUrl(sl.platform, e.target.value)}
                      placeholder={p?.placeholder ?? "https://…"}
                      className={cn(
                        "flex-1 text-xs font-mono bg-transparent border-none outline-none",
                        "text-text-primary placeholder:text-text-muted"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(sl.platform)}
                      className="p-1 rounded-lg text-text-muted hover:text-error hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Platform picker */}
          {availablePlatforms.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2">
                {socialLinks.length === 0 ? "Add a platform:" : "Add more:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addSocial(p.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border",
                      "text-xs font-medium text-text-secondary",
                      "hover:bg-lavender-light hover:border-lavender transition-all duration-150"
                    )}
                  >
                    <PlatformIcon id={p.id} size={11} />
                    <Plus size={10} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================
            Links on bio page (draggable reorder)
            ================================================================ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary">
              Links on bio page
            </label>
            <span className="text-xs text-text-muted">
              {selectedIds.length} active
            </span>
          </div>

          {linksLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-11 bg-lavender-light rounded-xl animate-pulse" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <p className="text-sm text-text-muted py-2">
              No links yet.{" "}
              <a href="/d/links/new" className="underline hover:text-text-primary">
                Create one →
              </a>
            </p>
          ) : (
            <div className="space-y-1.5">
              {/* Active + ordered links — draggable */}
              {activeLinks.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {activeLinks.map((link, idx) => (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing",
                        "border-lavender bg-lavender-light transition-all duration-150",
                        dragIdx === idx && "opacity-40 scale-[0.98]"
                      )}
                    >
                      <GripVertical size={14} className="text-text-muted flex-shrink-0 cursor-grab" />
                      <span className="text-sm font-medium text-text-primary truncate flex-1">
                        {link.title}
                      </span>
                      <span className="text-xs font-mono text-text-muted flex-shrink-0">
                        /{link.slug}
                      </span>
                      {link.isSmart && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">
                          Smart
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="p-1 rounded-lg text-text-muted hover:text-error hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inactive links — add buttons */}
              {inactiveLinks.length > 0 && (
                <div className="space-y-1.5">
                  {activeLinks.length > 0 && (
                    <p className="text-xs text-text-muted pt-1 pb-0.5">Not shown on bio:</p>
                  )}
                  {inactiveLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border border-dashed bg-surface text-text-secondary"
                    >
                      <span className="text-sm font-medium truncate flex-1">{link.title}</span>
                      <span className="text-xs font-mono text-text-muted flex-shrink-0">
                        /{link.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => addLink(link.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-lavender-dark hover:text-text-primary px-2 py-1 rounded-lg hover:bg-lavender-light transition-colors flex-shrink-0"
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" variant="primary" full disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Bio Page"}
        </Button>
      </form>

      {/* ================================================================
          Right: Live phone preview
          ================================================================ */}
      <div className="hidden xl:flex flex-col items-center gap-3 sticky top-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Live Preview
        </p>
        <BioPhonePreview
          displayName={displayName}
          username={username}
          bio={bioText}
          theme={theme}
          links={links}
          selectedIds={selectedIds}
          socialLinks={socialLinks}
        />
      </div>
    </div>
  );
}
