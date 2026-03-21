"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";

interface Platform {
  name: string;
  bg: string;
  icon: string | React.ReactNode;
}

const PLATFORMS: Platform[] = [
  { name: "Instagram", bg: "#fce8f0", icon: "📸" },
  { name: "TikTok", bg: "#eeedfe", icon: "🎵" },
  { name: "YouTube", bg: "#fef2f2", icon: "▶" },
  { name: "Twitter / X", bg: "#e8f0fc", icon: "🐦" },
  { name: "Spotify", bg: "#e1f5ee", icon: "🎵" },
  { name: "Apple Music", bg: "#fce8f0", icon: "🎵" },
  { name: "WhatsApp", bg: "#e1f5ee", icon: "💬" },
  { name: "Telegram", bg: "#e8f0fc", icon: "✈️" },
  { name: "LinkedIn", bg: "#e8f0fc", icon: "💼" },
  { name: "GitHub", bg: "#f0eeea", icon: "⌨" },
  { name: "Podcast", bg: "#faeeda", icon: "🎙" },
  { name: "Website", bg: "#f0eeea", icon: "🌐" },
  { name: "Email", bg: "#f0eeea", icon: "✉" },
  { name: "Discord", bg: "#eeedfe", icon: "💬" },
  { name: "Snapchat", bg: "#faeeda", icon: "👻" },
  { name: "Pinterest", bg: "#fef2f2", icon: "📌" },
  { name: "Twitch", bg: "#eeedfe", icon: "🎮" },
  { name: "Shop", bg: "#faeeda", icon: "🛒" },
];

export interface AddLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, urlStr?: string) => void;
}

export function AddLinkPopup({ isOpen, onClose, onAdd }: AddLinkPopupProps) {
  const [search, setSearch] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  if (!isOpen) return null;

  const filtered = search.trim()
    ? PLATFORMS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : PLATFORMS;

  const handleCustomAdd = () => {
    if (customTitle.trim()) {
      onAdd(customTitle.trim());
      setCustomTitle("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] w-[420px] max-h-[80vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-bold text-[#1a1a2e]">Add a link</h3>
        <p className="text-[12px] text-[#8a8a9a] mb-4">
          Choose a platform or add a custom link
        </p>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[12px] border border-[#e8e6e2] pl-3.5 pr-3.5 py-2.5 text-[13px] outline-none font-inter focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] transition-all"
            style={{ fontFamily: "inherit" }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {filtered.map((p) => (
            <button
              key={p.name}
              onClick={() => onAdd(p.name)}
              className="flex flex-col items-center gap-1.5 p-3.5 border border-[#e8e6e2] rounded-[12px] hover:border-[#e8b86d] hover:bg-[#faeeda] transition-all"
            >
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg shadow-sm"
                style={{ background: p.bg }}
              >
                {p.icon}
              </div>
              <span className="text-[11px] font-bold text-[#1a1a2e]">{p.name}</span>
            </button>
          ))}
        </div>

        <div className="text-center text-[11px] text-[#8a8a9a] py-3">
          or add a custom link
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Link title (e.g. My Blog)"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="flex-1 px-[14px] py-[10px] border border-[#e8e6e2] rounded-[12px] text-[12px] outline-none font-inter focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] transition-all"
          />
          <button
            onClick={handleCustomAdd}
            className="px-[18px] py-[10px] rounded-full bg-[#0a0a0f] text-white text-[12px] font-semibold whitespace-nowrap"
          >
            Add
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 border border-[#e8e6e2] rounded-full text-[12px] font-semibold text-[#8a8a9a] bg-white transition-colors hover:bg-[#f0eeea]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
