"use client";

import { useState } from "react";
import {
  QrCode, ImageIcon, Star, Clock, Lock,
  BarChart3, Trash2, Pencil, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddLinkPopup } from "./AddLinkPopup";
import { useDashboard, type BioLink } from "@/contexts/DashboardContext";

/* ─────────────────────────────────────────────
   Drag handle — 2×3 dot grid
───────────────────────────────────────────── */

function DragHandle() {
  return (
    <div className="cursor-grab p-1 mr-2 opacity-30 flex-shrink-0">
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
   Link card
───────────────────────────────────────────── */

function LinkCard({
  link,
  onToggle,
  onDelete,
}: {
  link: BioLink;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative bg-white border border-[#e8e6e2] rounded-[16px] transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

      {/* Smart badge */}
      {link.smart && (
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#faeeda] text-[#b8860b] text-[9px] font-semibold uppercase tracking-wide z-10">
          Smart
        </span>
      )}

      {/* ── Top row ── */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <DragHandle />

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[14px] font-semibold text-[#1a1a2e]">{link.title}</span>
            <button
              onClick={() => console.log("edit title", link.id)}
              className="opacity-30 hover:opacity-70 transition-opacity text-[#1a1a2e]"
            >
              <Pencil size={12} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#8a8a9a] font-mono truncate">
              tap-d.link/{link.slug}
            </span>
            <button
              onClick={() => console.log("edit url", link.id)}
              className="opacity-30 hover:opacity-70 transition-opacity text-[#8a8a9a] flex-shrink-0"
            >
              <Pencil size={11} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
          <button className="w-7 h-7 rounded-[6px] border border-[#e8e6e2] bg-white flex items-center justify-center text-[#8a8a9a] hover:border-[#8a8a9a] hover:text-[#1a1a2e] transition-all">
            <Share2 size={12} />
          </button>
          <Toggle on={link.active} onToggle={() => onToggle(link.id)} />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="flex items-center px-4 pb-3.5 pt-2 gap-2">
        <IconBtn icon={QrCode}    title="QR code" />
        <IconBtn icon={ImageIcon} title="Thumbnail" />
        <IconBtn icon={Star}      title="Priority" />
        <IconBtn icon={Clock}     title="Schedule" />
        <IconBtn icon={Lock}      title="Lock" />

        <div className="flex items-center gap-1 text-[12px] text-[#8a8a9a] ml-1 flex-shrink-0">
          <BarChart3 size={14} className="opacity-50" />
          <span>{link.clicks > 0 ? `${link.clicks.toLocaleString()} clicks` : "0 clicks"}</span>
        </div>

        <div className="ml-auto">
          <IconBtn icon={Trash2} title="Delete" danger onClick={() => onDelete(link.id)} />
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   Main editor
───────────────────────────────────────────── */

export function BioLinksEditor() {
  const { bioLinks: links, setBioLinks: setLinks } = useDashboard();
  const [showPopup, setShowPopup] = useState(false);

  const handleToggle = (id: string) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));

  const handleDelete = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  const handleAddLink = (name: string) => {
    const newId = Date.now().toString();
    const slug = name.toLowerCase().replace(/[\s\/]/g, "");
    setLinks((prev) => [
      ...prev,
      {
        id: newId,
        title: name,
        slug,
        smart: false,
        clicks: 0,
        active: true,
      },
    ]);
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

      {/* Link cards */}
      <div className="flex flex-col gap-3">
        {links.length === 0 ? (
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
          links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Popup */}
      <AddLinkPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onAdd={handleAddLink}
      />
    </>
  );
}
