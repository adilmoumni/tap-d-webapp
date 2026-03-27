"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBioEditor } from "@/contexts/BioEditorContext";

/* ── Preset swatches ── */

const BG_COLORS = ["#ffffff", "#f5f3f0", "#eeedfe", "#faeeda", "#e1f5ee", "#f5e6d3", "#0a0a0f", "#1a1a2e"];
const BUTTON_COLORS = ["#f5f3f0", "#ffffff", "#1a1a2e", "#e8b86d", "#a3e8c8", "#e8a0bf", "#a0c4e8", "#0a0a0f"];
const ACCENT_COLORS = ["#b8860b", "#22c55e", "#4a90e2", "#e8a0bf", "#9333ea", "#ef4444", "#f97316", "#1a1a2e"];

/* ── Normalize any CSS color string to #rrggbb for <input type="color"> ── */

function toHex6(color: string): string {
  // Already a valid 6-digit hex
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;

  // 3-digit hex → 6-digit
  const m3 = color.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`;

  // 8-digit hex → drop alpha
  if (/^#[0-9a-fA-F]{8}$/.test(color)) return color.slice(0, 7);

  // rgba(...) → parse and convert
  const mRgba = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (mRgba) {
    const r = Math.round(Number(mRgba[1])).toString(16).padStart(2, "0");
    const g = Math.round(Number(mRgba[2])).toString(16).padStart(2, "0");
    const b = Math.round(Number(mRgba[3])).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return "#000000";
}

/* ── Reusable color picker row ── */

export function ColorRow({
  label,
  presets,
  value,
  onChange,
}: {
  label: string;
  presets: string[];
  value: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(() => toHex6(value));
  const pickerRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);

  // Sync when value changes externally
  useEffect(() => setHex(toHex6(value)), [value]);

  // Close picker on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const applyHex = (raw: string) => {
    const v = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) {
      onChange(v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v);
    }
  };

  const hex6 = toHex6(value);

  return (
    <div className="mb-6 last:mb-0">
      <label className="block text-[12px] font-semibold text-[#1a1a2e] mb-3">{label}</label>

      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {/* Preset swatches */}
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => { onChange(color); setHex(color); }}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all p-[2px] flex-shrink-0",
                hex6 === color ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
              )}
            >
              <div
                className="w-full h-full rounded-full border border-[#e8e6e2]"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}

          {/* Custom color button */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setOpen(!open)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all p-[2px] flex-shrink-0",
                open ? "border-[#0a0a0f]" : "border-transparent hover:border-[#e8e6e2]"
              )}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                }}
              >
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </button>

            {/* Popup */}
            {open && (
              <div className="absolute top-10 left-0 z-50 bg-white rounded-[14px] border border-[#e8e6e2] shadow-lg p-3 w-[220px]">
                {/* Native color picker */}
                <div
                  className="w-full h-28 rounded-[10px] overflow-hidden cursor-pointer mb-3 border border-[#e8e6e2]"
                  onClick={() => nativeRef.current?.click()}
                >
                  <input
                    ref={nativeRef}
                    type="color"
                    value={hex6}
                    onChange={(e) => {
                      const c = e.target.value;
                      setHex(c);
                      onChange(c);
                    }}
                    className="w-[300%] h-[300%] -ml-[100%] -mt-[100%] cursor-pointer border-none"
                  />
                </div>

                {/* Hex input */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 border border-[#e8e6e2] rounded-[8px] px-2.5 py-1.5">
                    <span className="text-[12px] text-[#8a8a9a] mr-1">#</span>
                    <input
                      type="text"
                      maxLength={8}
                      value={hex.replace(/^#/, "")}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 8);
                        setHex(`#${v}`);
                      }}
                      onBlur={() => applyHex(hex)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyHex(hex); }}
                      className="flex-1 text-[12px] text-[#1a1a2e] font-mono outline-none bg-transparent w-0"
                      placeholder="000000"
                    />
                  </div>
                  <div
                    className="w-8 h-8 rounded-[8px] border border-[#e8e6e2] flex-shrink-0"
                    style={{ backgroundColor: hex6 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export function DesignColors() {
  const { data, updateTheme } = useBioEditor();

  return (
    <div className="font-inter">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-6">Colors</h2>

      <ColorRow
        label="Background color"
        presets={BG_COLORS}
        value={data.theme.backgroundColor}
        onChange={(c) => {
          if (data.theme.backgroundCss) updateTheme("backgroundCss", "");
          updateTheme("backgroundColor", c);
        }}
      />
      <ColorRow
        label="Button color"
        presets={BUTTON_COLORS}
        value={data.theme.buttonColor}
        onChange={(c) => updateTheme("buttonColor", c)}
      />
      <ColorRow
        label="Accent color"
        presets={ACCENT_COLORS}
        value={data.theme.accentColor}
        onChange={(c) => updateTheme("accentColor", c)}
      />
    </div>
  );
}
