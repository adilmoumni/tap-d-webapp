"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  QrCode, ImageIcon, Star, Clock, Lock, Unlock,
  BarChart3, Trash2, Pencil, Share2, Check, X,
  ChevronDown, ChevronUp, ExternalLink, KeyRound, ShieldAlert, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddLinkPopup } from "./AddLinkPopup";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { useAuth } from "@/hooks/useAuth";
import { uploadThumbnail } from "@/lib/storage";
import type { BioLink } from "@/types/bio";

/* ─────────────────────────────────────────────
   Platform icon map — SVG logos for known platforms
───────────────────────────────────────────── */

const PLATFORM_ICONS: Record<string, { emoji: string; bg: string; color: string }> = {
  instagram:    { emoji: "📸", bg: "#fce8f0", color: "#E1306C" },
  tiktok:       { emoji: "🎵", bg: "#eeedfe", color: "#000000" },
  youtube:      { emoji: "▶",  bg: "#fef2f2", color: "#FF0000" },
  "twitter / x":{ emoji: "𝕏",  bg: "#e8f0fc", color: "#000000" },
  "twitter/x":  { emoji: "𝕏",  bg: "#e8f0fc", color: "#000000" },
  twitter:      { emoji: "𝕏",  bg: "#e8f0fc", color: "#000000" },
  x:            { emoji: "𝕏",  bg: "#e8f0fc", color: "#000000" },
  spotify:      { emoji: "🎵", bg: "#e1f5ee", color: "#1DB954" },
  "apple music":{ emoji: "🎵", bg: "#fce8f0", color: "#FA243C" },
  whatsapp:     { emoji: "💬", bg: "#e1f5ee", color: "#25D366" },
  telegram:     { emoji: "✈️", bg: "#e8f0fc", color: "#0088cc" },
  linkedin:     { emoji: "💼", bg: "#e8f0fc", color: "#0A66C2" },
  github:       { emoji: "⌨",  bg: "#f0eeea", color: "#181717" },
  podcast:      { emoji: "🎙", bg: "#faeeda", color: "#9933CC" },
  website:      { emoji: "🌐", bg: "#f0eeea", color: "#4A90D9" },
  email:        { emoji: "✉",  bg: "#f0eeea", color: "#D44638" },
  discord:      { emoji: "💬", bg: "#eeedfe", color: "#5865F2" },
  snapchat:     { emoji: "👻", bg: "#faeeda", color: "#FFFC00" },
  pinterest:    { emoji: "📌", bg: "#fef2f2", color: "#E60023" },
  twitch:       { emoji: "🎮", bg: "#eeedfe", color: "#9146FF" },
  shop:         { emoji: "🛒", bg: "#faeeda", color: "#96BF48" },
};

function getPlatformIcon(title: string) {
  const key = title.toLowerCase().trim();
  return PLATFORM_ICONS[key] ?? null;
}

/* ─────────────────────────────────────────────
   Drag handle — 2×3 dot grid
───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DragHandle({ listeners, attributes }: { listeners?: any; attributes?: any }) {
  return (
    <div
      className="cursor-grab active:cursor-grabbing p-1 mr-2 opacity-30 hover:opacity-60 flex-shrink-0 transition-opacity"
      {...listeners}
      {...attributes}
    >
      <div className="grid grid-cols-2 gap-[3px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#1a1a2e] block" />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Toggle
───────────────────────────────────────────── */

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative w-10 h-[22px] rounded-[11px] cursor-pointer transition-colors duration-200 flex-shrink-0",
        on ? "bg-[#22c55e]" : "bg-[#e8e6e2]"
      )}
    >
      <div
        className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200"
        style={{
          left: on ? "calc(100% - 20px)" : "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Icon button (bottom row)
───────────────────────────────────────────── */

function IconBtn({
  icon: Icon,
  title,
  danger = false,
  onClick,
}: {
  icon: React.ElementType;
  title?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
        danger
          ? "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#fef2f2] hover:text-[#ef4444] hover:border-[#fecaca]"
          : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
      )}
    >
      <Icon size={15} />
    </button>
  );
}

/* ─────────────────────────────────────────────
   Platform icon badge
───────────────────────────────────────────── */

function PlatformBadge({ title, size = 36 }: { title: string; size?: number }) {
  const platform = getPlatformIcon(title);
  if (platform) {
    return (
      <div
        className="rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{
          width: size,
          height: size,
          background: platform.bg,
          fontSize: size * 0.45,
        }}
      >
        {platform.emoji}
      </div>
    );
  }
  // Generic link icon
  return (
    <div
      className="rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm bg-[#f0eeea]"
      style={{ width: size, height: size }}
    >
      <ExternalLink size={size * 0.4} className="text-[#8a8a9a]" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Inline editable text
───────────────────────────────────────────── */

function InlineEdit({
  value,
  onSave,
  className,
  placeholder,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          onBlur={commit}
          placeholder={placeholder}
          className={cn(
            "outline-none border border-[#e8b86d] rounded-[6px] px-1.5 py-0.5 bg-white",
            className
          )}
        />
        <button onClick={commit} className="text-[#22c55e] hover:text-[#16a34a]">
          <Check size={12} />
        </button>
        <button onClick={cancel} className="text-[#8a8a9a] hover:text-[#1a1a2e]">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className={className}>{value || placeholder}</span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-[#1a1a2e]"
      >
        <Pencil size={11} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Thumbnail panel (collapsible)
───────────────────────────────────────────── */

function ThumbnailPanel({
  link,
  onUpdate,
}: {
  link: BioLink;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadThumbnail(user.uid, link.id, file);
      onUpdate(link.id, { thumbnailUrl: url });
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
    const trimmed = urlDraft.trim();
    if (trimmed) {
      onUpdate(link.id, { thumbnailUrl: trimmed });
      setUrlDraft("");
    }
  };

  const handleRemove = () => {
    onUpdate(link.id, { thumbnailUrl: "" });
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Thumbnail</span>
          {link.thumbnailUrl && (
            <button
              onClick={handleRemove}
              className="text-[11px] text-[#ef4444] hover:text-[#dc2626] font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Current thumbnail preview */}
        {link.thumbnailUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={link.thumbnailUrl}
              alt="Thumbnail"
              className="w-16 h-16 rounded-[10px] object-cover border border-[#e8e6e2]"
            />
            <span className="text-[11px] text-[#8a8a9a] truncate flex-1">
              {link.thumbnailUrl.length > 50
                ? link.thumbnailUrl.slice(0, 50) + "..."
                : link.thumbnailUrl}
            </span>
          </div>
        )}

        {/* Upload button */}
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex-1 py-2 rounded-[10px] border border-dashed text-[12px] font-semibold transition-all",
              uploading
                ? "border-[#e8e6e2] text-[#8a8a9a] bg-[#f0eeea] cursor-wait"
                : "border-[#e8e6e2] text-[#8a8a9a] hover:border-[#e8b86d] hover:text-[#b8860b] hover:bg-[#faeeda]"
            )}
          >
            {uploading ? "Uploading..." : link.thumbnailUrl ? "Replace image" : "Upload image"}
          </button>
        </div>

        {/* Or paste URL */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Or paste image URL..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSave()}
            className="flex-1 px-3 py-1.5 border border-[#e8e6e2] rounded-[8px] text-[11px] outline-none focus:border-[#e8b86d] transition-colors"
          />
          {urlDraft.trim() && (
            <button
              onClick={handleUrlSave}
              className="px-3 py-1.5 rounded-[8px] bg-[#0a0a0f] text-white text-[11px] font-semibold"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Lock panel (collapsible)
───────────────────────────────────────────── */

type LockType = "none" | "code" | "password" | "sensitive";

const LOCK_OPTIONS: { type: LockType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "code",      label: "Code",              desc: "Visitors must enter a numeric code to view this link.",                                                       icon: Hash },
  { type: "password",  label: "Password",           desc: "Visitors must enter a password to view this link.",                                                           icon: KeyRound },
  { type: "sensitive", label: "Sensitive content",   desc: "Visitors must acknowledge that this link may contain content that is not appropriate for all audiences.", icon: ShieldAlert },
];

function LockPanel({
  link,
  onUpdate,
}: {
  link: BioLink;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const activeLock = link.lockType ?? "none";

  const selectLock = (type: LockType) => {
    if (type === activeLock) {
      // Toggle off
      onUpdate(link.id, { lockType: "none", lockCode: "", lockPassword: "" });
    } else {
      onUpdate(link.id, { lockType: type, lockCode: "", lockPassword: "" });
    }
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Lock this link</span>
          {activeLock !== "none" && (
            <button
              onClick={() => onUpdate(link.id, { lockType: "none", lockCode: "", lockPassword: "" })}
              className="text-[11px] text-[#ef4444] hover:text-[#dc2626] font-medium transition-colors"
            >
              Remove lock
            </button>
          )}
        </div>

        {/* Lock type options */}
        <div className="space-y-2">
          {LOCK_OPTIONS.map(({ type, label, desc, icon: Icon }) => {
            const isActive = activeLock === type;
            return (
              <div key={type}>
                <button
                  onClick={() => selectLock(type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-left transition-all",
                    isActive
                      ? "border-[#e8b86d] bg-[#faeeda]"
                      : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-[#e8b86d] text-white" : "bg-[#f0eeea] text-[#8a8a9a]"
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-[12px] font-semibold", isActive ? "text-[#b8860b]" : "text-[#1a1a2e]")}>
                      {label}
                    </div>
                    <div className="text-[10px] text-[#8a8a9a] leading-snug">{desc}</div>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-[#e8b86d] flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>

                {/* Input field for code / password */}
                {isActive && type === "code" && (
                  <div className="mt-2 ml-11">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter numeric code (e.g. 1234)"
                      value={link.lockCode ?? ""}
                      onChange={(e) => onUpdate(link.id, { lockCode: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] outline-none focus:border-[#e8b86d] transition-colors font-mono tracking-widest"
                      maxLength={8}
                    />
                  </div>
                )}

                {isActive && type === "password" && (
                  <div className="mt-2 ml-11">
                    <input
                      type="text"
                      placeholder="Enter password"
                      value={link.lockPassword ?? ""}
                      onChange={(e) => onUpdate(link.id, { lockPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] outline-none focus:border-[#e8b86d] transition-colors"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini stats panel (collapsible)
───────────────────────────────────────────── */

function StatsPanel({ link }: { link: BioLink }) {
  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Link analytics</span>
          <span className="text-[11px] text-[#8a8a9a]">All time</span>
        </div>

        {/* Total clicks */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[24px] font-bold text-[#1a1a2e]">
              {link.clicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8a8a9a]">Total clicks</div>
          </div>
        </div>

        {/* Slug info */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#e8e6e2]">
          <span className="text-[11px] text-[#8a8a9a]">Short URL:</span>
          <span className="text-[11px] font-mono text-[#1a1a2e]">tap-d.link/{link.slug}</span>
        </div>

        {link.isSmart && (
          <div className="space-y-1.5 pt-1 border-t border-[#e8e6e2]">
            <span className="text-[11px] font-semibold text-[#b8860b]">Smart Link destinations</span>
            {link.iosUrl && (
              <div className="text-[11px] text-[#8a8a9a] truncate">
                <span className="font-medium text-[#1a1a2e]">iOS:</span> {link.iosUrl}
              </div>
            )}
            {link.androidUrl && (
              <div className="text-[11px] text-[#8a8a9a] truncate">
                <span className="font-medium text-[#1a1a2e]">Android:</span> {link.androidUrl}
              </div>
            )}
            {link.fallbackUrl && (
              <div className="text-[11px] text-[#8a8a9a] truncate">
                <span className="font-medium text-[#1a1a2e]">Desktop:</span> {link.fallbackUrl}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sortable Link card
───────────────────────────────────────────── */

function SortableLinkCard({
  link,
  onToggle,
  onDelete,
  onUpdate,
}: {
  link: BioLink;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const [statsOpen, setStatsOpen] = useState(false);
  const [thumbnailOpen, setThumbnailOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-white border border-[#e8e6e2] rounded-[16px] transition-shadow",
        isDragging ? "shadow-lg" : "hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* Smart badge */}
      {link.isSmart && (
        <span className="absolute top-3 right-14 px-2 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[9px] font-semibold uppercase tracking-wide z-10">
          Smart
        </span>
      )}

      {/* Top row */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <DragHandle listeners={listeners} attributes={attributes} />

        {/* Platform icon */}
        <PlatformBadge title={link.title} />

        {/* Body */}
        <div className="flex-1 min-w-0 ml-3">
          <InlineEdit
            value={link.title}
            onSave={(val) => onUpdate(link.id, { title: val })}
            className="text-[14px] font-semibold text-[#1a1a2e]"
            placeholder="Link title"
          />
          <InlineEdit
            value={link.slug}
            onSave={(val) => onUpdate(link.id, { slug: val.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            className="text-[12px] text-[#8a8a9a] font-mono"
            placeholder="slug"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
          <button className="w-7 h-7 rounded-[6px] border border-[#e8e6e2] bg-white flex items-center justify-center text-[#8a8a9a] hover:border-[#8a8a9a] hover:text-[#1a1a2e] transition-all">
            <Share2 size={12} />
          </button>
          <Toggle on={link.isVisible} onToggle={() => onToggle(link.id)} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center px-4 pb-3.5 pt-2 gap-2">
        <IconBtn icon={QrCode} title="QR code" />
        <button
          onClick={() => setThumbnailOpen(!thumbnailOpen)}
          title="Thumbnail"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            thumbnailOpen
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.thumbnailUrl
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <ImageIcon size={15} />
        </button>
        <IconBtn icon={Star} title="Priority" />
        <IconBtn icon={Clock} title="Schedule" />
        <button
          onClick={() => setLockOpen(!lockOpen)}
          title="Lock"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            lockOpen
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.lockType && link.lockType !== "none"
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <Lock size={15} />
        </button>

        {/* Clickable stats toggle */}
        <button
          onClick={() => setStatsOpen(!statsOpen)}
          className={cn(
            "flex items-center gap-1 text-[12px] ml-1 flex-shrink-0 px-2 py-1 rounded-[8px] transition-all",
            statsOpen
              ? "bg-[#faf8fc] text-[#1a1a2e] font-semibold"
              : "text-[#8a8a9a] hover:bg-[#faf8fc] hover:text-[#1a1a2e]"
          )}
        >
          <BarChart3 size={14} className={statsOpen ? "text-[#e8b86d]" : "opacity-50"} />
          <span>{link.clicks > 0 ? `${link.clicks.toLocaleString()} clicks` : "0 clicks"}</span>
          {statsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className="ml-auto">
          <IconBtn icon={Trash2} title="Delete" danger onClick={() => onDelete(link.id)} />
        </div>
      </div>

      {/* Collapsible thumbnail */}
      {thumbnailOpen && <ThumbnailPanel link={link} onUpdate={onUpdate} />}

      {/* Collapsible lock */}
      {lockOpen && <LockPanel link={link} onUpdate={onUpdate} />}

      {/* Collapsible stats */}
      {statsOpen && <StatsPanel link={link} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main editor
───────────────────────────────────────────── */

export function BioLinksEditor() {
  const { data, addLink, removeLink, updateLink, reorderLinks, toggleLinkVisibility } = useBioEditor();
  const [showPopup, setShowPopup] = useState(false);

  const sortedLinks = [...data.links].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedLinks.findIndex((l) => l.id === active.id);
      const newIndex = sortedLinks.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderLinks(oldIndex, newIndex);
      }
    },
    [sortedLinks, reorderLinks]
  );

  const handleAddLink = (name: string) => {
    const slug = name.toLowerCase().replace(/[\s/]/g, "");
    const platform = getPlatformIcon(name);
    addLink({
      title: name,
      slug,
      icon: platform ? name.toLowerCase() : "",
    });
    setShowPopup(false);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[#1a1a2e]">Bio links</h2>
      </div>

      {/* Add link button */}
      <button
        onClick={() => setShowPopup(true)}
        className="w-full flex items-center justify-center gap-2 p-3.5 mb-4 border-2 border-dashed border-[#e8e6e2] rounded-[16px] text-[13px] font-semibold text-[#8a8a9a] bg-white transition-all duration-200 hover:border-[#e8b86d] hover:text-[#b8860b] hover:bg-[#faeeda]"
      >
        + Add link
      </button>

      {/* Link cards with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedLinks.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {sortedLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-[14px] font-semibold text-[#8a8a9a] mb-1">No links yet</h3>
                <p className="text-[13px] text-[#8a8a9a] opacity-70 mb-4">Add your first link to get started</p>
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-6 py-2.5 rounded-full bg-[#0a0a0f] text-white text-[13px] font-semibold hover:bg-[#1a1a2e] transition-colors"
                >
                  + Add link
                </button>
              </div>
            ) : (
              sortedLinks.map((link) => (
                <SortableLinkCard
                  key={link.id}
                  link={link}
                  onToggle={toggleLinkVisibility}
                  onDelete={removeLink}
                  onUpdate={updateLink}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Popup */}
      <AddLinkPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onAdd={handleAddLink}
      />
    </>
  );
}
