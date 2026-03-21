"use client";

import { useState } from "react";
import { Download, QrCode, Copy, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLinks } from "@/hooks/useLinks";
import { QRCode } from "@/components/shared/QRCode";
import { cn } from "@/lib/utils";
import type { SmartLink } from "@/types";

/* ------------------------------------------------------------------
   Colour presets for the QR code
------------------------------------------------------------------ */
const COLOR_PRESETS = [
  { id: "dark",    label: "Dark",    dark: "#0a0a0f", light: "#ffffff" },
  { id: "lavender",label: "Lavender",dark: "#6b5b95", light: "#f3f0fb" },
  { id: "mint",    label: "Mint",    dark: "#1a5c4a", light: "#e8faf4" },
  { id: "pink",    label: "Pink",    dark: "#7a2248", light: "#fdeef5" },
] as const;

type PresetId = typeof COLOR_PRESETS[number]["id"];

const SIZE_OPTIONS = [160, 220, 280] as const;
type SizeOption = typeof SIZE_OPTIONS[number];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link";

/* ------------------------------------------------------------------
   Link selector item
------------------------------------------------------------------ */
function LinkItem({
  link,
  selected,
  onClick,
}: {
  link: SmartLink;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150",
        selected
          ? "bg-lavender-light border border-lavender"
          : "bg-surface border border-border hover:border-lavender/60 hover:bg-lavender-light/40"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
          selected ? "bg-lavender text-text-primary" : "bg-lavender-light text-text-muted"
        )}
      >
        <Link2 size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{link.title}</p>
        <p className="text-xs text-text-muted font-mono truncate">
          {APP_URL}/{link.slug}
        </p>
      </div>
      {link.isSmart && (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
          Smart
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------
   Main page
------------------------------------------------------------------ */
export default function QRPage() {
  const { links, loading } = useLinks();

  const [selected, setSelected] = useState<SmartLink | null>(null);
  const [preset, setPreset]     = useState<PresetId>("dark");
  const [size, setSize]         = useState<SizeOption>(220);
  const [withLogo, setWithLogo] = useState(true);
  const [copied, setCopied]     = useState(false);

  const activePreset = COLOR_PRESETS.find((p) => p.id === preset)!;
  const linkUrl      = selected ? `${APP_URL}/${selected.slug}` : null;

  const handleCopy = async () => {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#qr-preview canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${selected?.slug ?? "code"}.png`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-1">QR Codes</h2>
        <p className="text-sm text-text-muted">
          Generate a downloadable QR code for any of your smart links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ---- Left: link list ---- */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-text-primary mb-4">Select a link</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-lavender-light rounded-xl animate-pulse" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-lavender-light flex items-center justify-center mx-auto mb-3">
                <Link2 size={20} className="text-lavender-dark" />
              </div>
              <p className="text-sm text-text-muted">No links yet. Create one first.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  selected={selected?.id === link.id}
                  onClick={() => setSelected(link)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---- Right: QR preview + options ---- */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* QR preview card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center">
            {selected ? (
              <>
                <div
                  id="qr-preview"
                  className="mb-4"
                  style={{ background: activePreset.light, padding: 16, borderRadius: 16 }}
                >
                  <QRCode
                    value={linkUrl!}
                    size={size}
                    logo={withLogo}
                    color={{ dark: activePreset.dark, light: activePreset.light }}
                  />
                </div>

                {/* URL pill */}
                <div className="flex items-center gap-2 bg-lavender-light border border-lavender/40 rounded-full px-4 py-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0" />
                  <span className="text-xs font-mono text-text-secondary truncate max-w-[240px]">
                    {linkUrl}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy URL"}
                  </Button>
                  <Button variant="primary" size="sm" dot onClick={handleDownload}>
                    <Download size={13} />
                    Download PNG
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-16 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-lavender-light flex items-center justify-center mb-4">
                  <QrCode size={28} className="text-lavender-dark" />
                </div>
                <p className="font-serif text-lg font-medium text-text-primary mb-1">
                  Select a link to generate
                </p>
                <p className="text-sm text-text-muted max-w-xs">
                  Choose any link from the list on the left to preview and download its QR code.
                </p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
            <h3 className="font-semibold text-text-primary">Customise</h3>

            {/* Colour presets */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                Colour
              </p>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    title={p.label}
                    className={cn(
                      "w-9 h-9 rounded-xl border-2 transition-all duration-150",
                      preset === p.id ? "border-lavender-dark scale-110" : "border-border hover:border-lavender"
                    )}
                    style={{ background: p.dark }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                Size
              </p>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150",
                      size === s
                        ? "bg-lavender-light border-lavender text-text-primary"
                        : "bg-transparent border-border text-text-muted hover:bg-lavender-light/40"
                    )}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            {/* Logo toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Show tap-d logo</p>
                <p className="text-xs text-text-muted">Embed the tap-d dot in the center of the QR code</p>
              </div>
              <button
                onClick={() => setWithLogo((v) => !v)}
                className={cn(
                  "relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0",
                  withLogo ? "bg-dark" : "bg-border"
                )}
                style={{ height: 22, width: 40 }}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    withLogo ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
