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
  ChevronDown, ChevronUp, ExternalLink, KeyRound, ShieldAlert, Hash, CalendarClock, LayoutGrid,
  Zap, ArrowRight, MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddLinkPopup } from "./AddLinkPopup";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { useAuth } from "@/hooks/useAuth";
import { uploadThumbnail } from "@/lib/storage";
import { findPlatform } from "@/lib/platforms";
import Image from "next/image";
import type { BioLink } from "@/types/bio";
import { QRPreview } from "@/components/dashboard/qr/QRPreview";
import { normalizeOutboundUrl } from "@/lib/url-safety";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link";

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

function Toggle({ on, onToggle, disabled = false }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  const active = on && !disabled;
  return (
    <div
      role="switch"
      aria-checked={active}
      onClick={() => {
        if (disabled) return;
        onToggle();
      }}
      title={disabled ? "Add a title and valid URL to enable" : undefined}
      className={cn(
        "relative w-10 h-[22px] rounded-[11px] transition-colors duration-200 flex-shrink-0",
        disabled ? "bg-[#e8e6e2] opacity-50 cursor-not-allowed" : "cursor-pointer",
        !disabled && active && "bg-[#22c55e]",
        !disabled && !active && "bg-[#e8e6e2]"
      )}
    >
      <div
        className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200"
        style={{
          left: active ? "calc(100% - 20px)" : "2px",
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
  const platform = findPlatform(title);
  if (platform) {
    return (
      <div
        className="rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden"
        style={{ width: size, height: size, background: platform.bg }}
      >
        <Image
          src={platform.svgPath}
          alt={platform.name}
          width={Math.round(size)}
          height={Math.round(size)}
        />
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

function isValidUrl(str: string): boolean {
  return !!normalizeOutboundUrl(str, { allowRelative: true });
}

function InlineEdit({
  value,
  onSave,
  className,
  placeholder,
  validate,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
  /** If set, validate before saving. Return error string or empty for valid. */
  validate?: (val: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");

  const startEdit = () => {
    setDraft(value);
    setError("");
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      cancel();
      return;
    }
    if (validate) {
      const err = validate(trimmed);
      if (err) {
        setError(err);
        return;
      }
    }
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
    setError("");
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
    setError("");
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            onBlur={commit}
            placeholder={placeholder}
            className={cn(
              "outline-none border rounded-[6px] px-1.5 py-0.5 bg-white",
              error ? "border-[#ef4444]" : "border-[#e8b86d]",
              className
            )}
          />
          <button onClick={commit} className="text-[#22c55e] hover:text-[#16a34a]">
            <Check size={12} />
          </button>
          <button onMouseDown={cancel} className="text-[#8a8a9a] hover:text-[#1a1a2e]">
            <X size={12} />
          </button>
        </div>
        {error && (
          <span className="text-[10px] text-[#ef4444] font-medium ml-0.5">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className={className}>{value || <span className="opacity-40">{placeholder}</span>}</span>
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

/* ─────────────────────────────────────────────
   Layout panel (collapsible)
───────────────────────────────────────────── */

function LayoutPanel({
  link,
  onUpdate,
}: {
  link: BioLink;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const current = link.layout ?? "classic";

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <span className="text-[12px] font-semibold text-[#1a1a2e]">Choose a layout for your link</span>

        <div className="space-y-2">
          {/* Classic */}
          <button
            onClick={() => onUpdate(link.id, { layout: "classic" })}
            className={cn(
              "w-full rounded-[12px] border p-4 text-left transition-all",
              current === "classic"
                ? "border-[#1a1a2e] border-2 bg-white"
                : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Radio */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                current === "classic" ? "border-[#1a1a2e]" : "border-[#d0cec8]"
              )}>
                {current === "classic" && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1a1a2e]">Classic</div>
                <div className="text-[11px] text-[#8a8a9a] mb-3">Efficient, direct and compact.</div>
                {/* Mini preview */}
                <div className="flex items-center gap-2 bg-[#e8e6e2] rounded-full px-2 py-1.5 max-w-[180px]">
                  <div className="w-6 h-6 rounded-full bg-[#d0cec8] flex-shrink-0" />
                  <div className="flex-1 h-2 bg-[#d0cec8] rounded-full" />
                  <div className="w-1 h-1 rounded-full bg-[#8a8a9a]" />
                  <div className="w-1 h-1 rounded-full bg-[#8a8a9a]" />
                  <div className="w-1 h-1 rounded-full bg-[#8a8a9a]" />
                </div>
              </div>
            </div>
          </button>

          {/* Featured */}
          <button
            onClick={() => onUpdate(link.id, { layout: "featured" })}
            className={cn(
              "w-full rounded-[12px] border p-4 text-left transition-all",
              current === "featured"
                ? "border-[#1a1a2e] border-2 bg-white"
                : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Radio */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                current === "featured" ? "border-[#1a1a2e]" : "border-[#d0cec8]"
              )}>
                {current === "featured" && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1a1a2e]">Featured</div>
                <div className="text-[11px] text-[#8a8a9a] mb-3">Make your link stand out with a larger, more attractive display.</div>
                {/* Mini preview — card-like */}
                <div className="max-w-[180px] rounded-[10px] overflow-hidden border border-[#e8e6e2]">
                  <div className="h-16 bg-gradient-to-br from-[#e8b86d] to-[#d4a85c]" />
                  <div className="px-2 py-1.5">
                    <div className="h-2 bg-[#e8e6e2] rounded-full w-3/4 mb-1" />
                    <div className="h-1.5 bg-[#f0eeea] rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
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
  { type: "code",      label: "Code",               desc: "Visitors must enter a numeric code to view this link.",                                                       icon: Hash },
  { type: "password",  label: "Access phrase",      desc: "Visitors must enter a custom phrase for this link. Never ask for account passwords.",                        icon: KeyRound },
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
                      placeholder="Enter access phrase"
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
   Schedule panel (collapsible)
───────────────────────────────────────────── */

function formatDateLabel(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function toLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SchedulePanel({
  link,
  onUpdate,
}: {
  link: BioLink;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const hasSchedule = !!link.scheduleStart;

  const handleClear = () => {
    onUpdate(link.id, { scheduleStart: null, scheduleEnd: null });
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Schedule</span>
          {hasSchedule && (
            <button
              onClick={handleClear}
              className="text-[11px] text-[#ef4444] hover:text-[#dc2626] font-medium transition-colors"
            >
              Remove schedule
            </button>
          )}
        </div>

        <p className="text-[10px] text-[#8a8a9a] leading-snug">
          Set when this link should be visible. It will only appear on your bio page during the scheduled window.
        </p>

        {/* Start date */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#1a1a2e]">
            Start date <span className="text-[#ef4444]">*</span>
          </label>
          <input
            type="datetime-local"
            value={toLocalDatetime(link.scheduleStart)}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate(link.id, { scheduleStart: val ? new Date(val).toISOString() : null });
            }}
            className="w-full px-3 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] outline-none focus:border-[#e8b86d] transition-colors bg-white"
          />
          {link.scheduleStart && (
            <p className="text-[10px] text-[#8a8a9a]">
              <CalendarClock size={10} className="inline mr-1 opacity-60" />
              Goes live: {formatDateLabel(link.scheduleStart)}
            </p>
          )}
        </div>

        {/* End date */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#1a1a2e]">
            End date <span className="text-[10px] font-normal text-[#8a8a9a]">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={toLocalDatetime(link.scheduleEnd)}
            min={toLocalDatetime(link.scheduleStart)}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate(link.id, { scheduleEnd: val ? new Date(val).toISOString() : null });
            }}
            className="w-full px-3 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] outline-none focus:border-[#e8b86d] transition-colors bg-white"
          />
          {link.scheduleEnd && (
            <p className="text-[10px] text-[#8a8a9a]">
              <CalendarClock size={10} className="inline mr-1 opacity-60" />
              Expires: {formatDateLabel(link.scheduleEnd)}
            </p>
          )}
          {!link.scheduleEnd && link.scheduleStart && (
            <p className="text-[10px] text-[#8a8a9a] italic">No end date — link stays visible once live.</p>
          )}
        </div>

        {/* Status indicator */}
        {hasSchedule && (() => {
          const now = new Date();
          const start = new Date(link.scheduleStart!);
          const end = link.scheduleEnd ? new Date(link.scheduleEnd) : null;
          const isLive = now >= start && (!end || now <= end);
          const isExpired = end && now > end;
          const isPending = now < start;

          return (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-[8px] text-[11px] font-semibold",
                isLive && "bg-[#dcfce7] text-[#16a34a]",
                isPending && "bg-[#faeeda] text-[#b8860b]",
                isExpired && "bg-[#fef2f2] text-[#ef4444]",
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isLive && "bg-[#22c55e]",
                  isPending && "bg-[#e8b86d]",
                  isExpired && "bg-[#ef4444]",
                )}
              />
              {isLive && "Currently live"}
              {isPending && "Scheduled — not yet live"}
              {isExpired && "Expired — no longer visible"}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Priority panel (collapsible)
───────────────────────────────────────────── */

type PriorityMode = "none" | "animate" | "redirect";
type AnimationType = "buzz" | "wobble" | "pop" | "swipe";

const ANIMATION_OPTIONS: { type: AnimationType; label: string }[] = [
  { type: "buzz", label: "BUZZ" },
  { type: "wobble", label: "WOBBLE" },
  { type: "pop", label: "POP" },
  { type: "swipe", label: "SWIPE" },
];

function PriorityPanel({
  link,
  onUpdate,
}: {
  link: BioLink;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
}) {
  const mode = link.prioritize ?? "none";
  const anim = link.animationType ?? "buzz";

  const selectMode = (m: PriorityMode) => {
    if (m === "none") {
      onUpdate(link.id, { prioritize: "none", animationType: "buzz", redirectUntil: null });
    } else if (m === "animate") {
      onUpdate(link.id, { prioritize: "animate", redirectUntil: null });
    } else {
      onUpdate(link.id, { prioritize: "redirect" });
    }
  };

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Prioritize</span>
          {mode !== "none" && (
            <button
              onClick={() => selectMode("none")}
              className="text-[11px] text-[#ef4444] hover:text-[#dc2626] font-medium transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        <p className="text-[10px] text-[#8a8a9a] leading-snug">
          Draw attention or even redirect traffic to your most important link. Only one link can be prioritized at a time.
        </p>

        <div className="space-y-2">
          {/* Animate */}
          <div>
            <button
              onClick={() => selectMode("animate")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-left transition-all",
                mode === "animate"
                  ? "border-[#1a1a2e] border-2 bg-white"
                  : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                mode === "animate" ? "border-[#1a1a2e]" : "border-[#d0cec8]"
              )}>
                {mode === "animate" && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1a1a2e]">Animate</div>
                <div className="text-[10px] text-[#8a8a9a]">Apply a fun and engaging motion effect to this link.</div>
              </div>
              <Zap size={16} className={mode === "animate" ? "text-[#e8b86d]" : "text-[#d0cec8]"} />
            </button>

            {/* Animation type picker */}
            {mode === "animate" && (
              <div className="flex gap-2 mt-2 ml-8">
                {ANIMATION_OPTIONS.map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => onUpdate(link.id, { animationType: type })}
                    className={cn(
                      "flex-1 py-2 rounded-[10px] border text-[11px] font-bold tracking-wide transition-all",
                      anim === type
                        ? "border-[#1a1a2e] border-2 bg-white text-[#1a1a2e]"
                        : "border-[#e8e6e2] bg-white text-[#8a8a9a] hover:border-[#d0cec8]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Redirect */}
          <div>
            <button
              onClick={() => selectMode("redirect")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-left transition-all",
                mode === "redirect"
                  ? "border-[#1a1a2e] border-2 bg-white"
                  : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                mode === "redirect" ? "border-[#1a1a2e]" : "border-[#d0cec8]"
              )}>
                {mode === "redirect" && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1a1a2e]">Redirect</div>
                <div className="text-[10px] text-[#8a8a9a]">Temporarily send all visitors straight to this link instead of your bio page.</div>
              </div>
              <ArrowRight size={16} className={mode === "redirect" ? "text-[#e8b86d]" : "text-[#d0cec8]"} />
            </button>

            {/* Redirect until date */}
            {mode === "redirect" && (
              <div className="mt-2 ml-8 space-y-1">
                <label className="text-[11px] font-semibold text-[#1a1a2e]">
                  Active until <span className="text-[10px] font-normal text-[#8a8a9a]">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={toLocalDatetime(link.redirectUntil)}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdate(link.id, { redirectUntil: val ? new Date(val).toISOString() : null });
                  }}
                  className="w-full px-3 py-2 border border-[#e8e6e2] rounded-[8px] text-[12px] outline-none focus:border-[#e8b86d] transition-colors bg-white"
                />
                {link.redirectUntil && (
                  <p className="text-[10px] text-[#8a8a9a]">
                    <CalendarClock size={10} className="inline mr-1 opacity-60" />
                    Redirects until: {formatDateLabel(link.redirectUntil)}
                  </p>
                )}
                {!link.redirectUntil && (
                  <p className="text-[10px] text-[#8a8a9a] italic">No end date — redirect stays active until removed.</p>
                )}
              </div>
            )}
          </div>

          {/* Don't prioritize */}
          <button
            onClick={() => selectMode("none")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-left transition-all",
              mode === "none"
                ? "border-[#1a1a2e] border-2 bg-white"
                : "border-[#e8e6e2] bg-white hover:border-[#d0cec8]"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              mode === "none" ? "border-[#1a1a2e]" : "border-[#d0cec8]"
            )}>
              {mode === "none" && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#1a1a2e]">Don&apos;t prioritize this link</div>
            </div>
            <MinusCircle size={16} className={mode === "none" ? "text-[#8a8a9a]" : "text-[#d0cec8]"} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini stats panel (collapsible)
───────────────────────────────────────────── */

function StatsPanel({ link }: { link: BioLink }) {
  const total = link.clicks || 1;
  const ios = link.iosClicks || 0;
  const android = link.androidClicks || 0;
  const desktop = link.desktopClicks || 0;
  
  const devs = [
    { label: "iOS",     value: ios,     pct: Math.round((ios / total) * 100),     color: "#e8b86d" },
    { label: "Android", value: android, pct: Math.round((android / total) * 100), color: "#7c6cef" },
    { label: "Desktop", value: desktop, pct: Math.round((desktop / total) * 100), color: "#5cb98c" },
  ].filter(d => d.value > 0);

  const countries = Object.entries(link.countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, clicks]) => ({ name, clicks }));

  return (
    <div className="px-4 pb-4 pt-1">
      <div className="bg-[#faf8fc] rounded-[12px] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#1a1a2e]">Link analytics</span>
          <span className="text-[11px] text-[#8a8a9a]">All time</span>
        </div>

        {/* Total clicks */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-[10px] p-3 border border-[#e8e6e2]">
            <p className="text-[10px] text-[#8a8a9a] mb-0.5">Total Clicks</p>
            <p className="text-[22px] font-bold text-[#1a1a2e]">{link.clicks.toLocaleString()}</p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
             {link.isSmart && (
               <div className="text-[10px] text-[#8a8a9a]">
                 <strong className="text-[#e8b86d] font-semibold">Smart Link</strong> enabled.<br/>
                 Routing visitors by device.
               </div>
             )}
          </div>
        </div>

        {/* Devices breakdown */}
        {devs.length > 0 && (
          <div className="bg-white rounded-[10px] p-3 border border-[#e8e6e2]">
            <p className="text-[10px] text-[#8a8a9a] mb-2 font-medium">Devices</p>
            <div className="flex rounded-full overflow-hidden h-3 gap-[1px] mb-2">
              {devs.map((d) => (
                <div
                  key={d.label}
                  style={{ width: `${d.pct}%`, background: d.color }}
                  title={`${d.label}: ${d.pct}%`}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-1">
              {devs.map(({label, color, pct}) => (
                <span key={label} className="flex items-center gap-1 text-[10px] text-[#1a1a2e] font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{background: color}} />
                  {label} {pct}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Countries */}
        {countries.length > 0 && (
          <div className="bg-white rounded-[10px] p-3 border border-[#e8e6e2]">
            <p className="text-[10px] text-[#8a8a9a] mb-2 font-medium">Top Locations</p>
            <div className="space-y-1.5">
              {countries.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#1a1a2e]">{c.name}</span>
                  <span className="font-semibold text-[#1a1a2e]">{c.clicks.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slug info */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#e8e6e2]">
          <span className="text-[11px] text-[#8a8a9a]">Short URL:</span>
          <span className="text-[11px] font-mono text-[#1a1a2e]">tap-d.link/{link.slug}</span>
        </div>
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
  bioSlug,
}: {
  link: BioLink;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<BioLink>) => void;
  bioSlug?: string;
}) {
  type Panel = "layout" | "qr" | "thumbnail" | "priority" | "schedule" | "lock" | "stats" | null;
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const toggle = (p: Panel) => setActivePanel(prev => prev === p ? null : p);


  const linkUrl = link.url || link.fallbackUrl || "";
  const hasValidUrl = linkUrl ? isValidUrl(linkUrl) : false;
  const isComplete = !!link.title.trim() && hasValidUrl;

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
            value={link.url || link.fallbackUrl || ""}
            onSave={(val) => {
              const normalized = normalizeOutboundUrl(val, { allowRelative: true });
              if (!normalized) return;
              onUpdate(link.id, { url: normalized, fallbackUrl: normalized });
            }}
            validate={(val) => {
              return normalizeOutboundUrl(val, { allowRelative: true })
                ? ""
                : "Please enter a valid URL (http/https)";
            }}
            className="text-[12px] text-[#8a8a9a] font-mono"
            placeholder="https://..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
          <button className="w-7 h-7 rounded-[6px] border border-[#e8e6e2] bg-white flex items-center justify-center text-[#8a8a9a] hover:border-[#8a8a9a] hover:text-[#1a1a2e] transition-all">
            <Share2 size={12} />
          </button>
          <Toggle on={link.isVisible} onToggle={() => onToggle(link.id)} disabled={!isComplete} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center px-4 pb-3.5 pt-2 gap-2">
        <button
          onClick={() => toggle("layout")}
          title="Layout"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "layout"
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.layout === "featured"
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <LayoutGrid size={15} />
        </button>
        <button
          onClick={() => toggle("qr")}
          title="QR code"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "qr"
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <QrCode size={15} />
        </button>
        <button
          onClick={() => toggle("thumbnail")}
          title="Thumbnail"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "thumbnail"
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.thumbnailUrl
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <ImageIcon size={15} />
        </button>
        <button
          onClick={() => toggle("priority")}
          title="Priority"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "priority"
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.prioritize && link.prioritize !== "none"
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <Star size={15} />
        </button>
        <button
          onClick={() => toggle("schedule")}
          title="Schedule"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "schedule"
              ? "border-[#e8b86d] bg-[#faeeda] text-[#b8860b]"
              : link.scheduleStart
                ? "border-[#e8b86d] bg-white text-[#b8860b] hover:bg-[#faeeda]"
                : "border-[#f0eeea] bg-white text-[#8a8a9a] hover:bg-[#f0eeea] hover:text-[#1a1a2e]"
          )}
        >
          <Clock size={15} />
        </button>
        <button
          onClick={() => toggle("lock")}
          title="Lock"
          className={cn(
            "w-[30px] h-[30px] rounded-[8px] border flex items-center justify-center transition-all duration-150 flex-shrink-0",
            activePanel === "lock"
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
          onClick={() => toggle("stats")}
          className={cn(
            "flex items-center gap-1 text-[12px] ml-1 flex-shrink-0 px-2 py-1 rounded-[8px] transition-all",
            activePanel === "stats"
              ? "bg-[#faf8fc] text-[#1a1a2e] font-semibold"
              : "text-[#8a8a9a] hover:bg-[#faf8fc] hover:text-[#1a1a2e]"
          )}
        >
          <BarChart3 size={14} className={activePanel === "stats" ? "text-[#e8b86d]" : "opacity-50"} />
          <span>{link.clicks > 0 ? `${link.clicks.toLocaleString()} clicks` : "0 clicks"}</span>
          {activePanel === "stats" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div className="ml-auto">
          <IconBtn icon={Trash2} title="Delete" danger onClick={() => onDelete(link.id)} />
        </div>
      </div>

      {/* Collapsible QR */}
      {activePanel === "qr" && (
        <div className="px-4 pb-4 pt-1">
          <div className="bg-[#faf8fc] rounded-[12px] p-4 flex flex-col items-center gap-3">
            <span className="text-[11px] font-semibold text-[#8a8a9a] uppercase tracking-wider self-start">
              QR Code — scan to open this link
            </span>
            <QRPreview
              url={link.slug ? `${APP_URL}/${link.slug}` : (link.url || link.fallbackUrl || APP_URL)}
              label={link.slug ? `/${link.slug}` : (link.url || link.fallbackUrl || "")}
              size={150}
            />
            <p className="text-[10px] text-[#8a8a9a] text-center leading-relaxed max-w-[220px]">
              Scanning routes visitors to the right destination via smart link detection.
            </p>
          </div>
        </div>
      )}

      {/* Collapsible panels — accordion: only one open at a time */}
      {activePanel === "layout"   && <LayoutPanel   link={link} onUpdate={onUpdate} />}
      {activePanel === "thumbnail" && <ThumbnailPanel link={link} onUpdate={onUpdate} />}
      {activePanel === "priority" && <PriorityPanel  link={link} onUpdate={onUpdate} />}
      {activePanel === "lock"     && <LockPanel      link={link} onUpdate={onUpdate} />}
      {activePanel === "schedule" && <SchedulePanel  link={link} onUpdate={onUpdate} />}
      {activePanel === "stats"    && <StatsPanel     link={link} />}

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
    addLink({ title: name, isSmart: false });
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
                  bioSlug={data.slug || ""}
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
