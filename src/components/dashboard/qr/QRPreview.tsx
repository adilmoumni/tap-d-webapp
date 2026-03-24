"use client";

import { useState, useEffect } from "react";
import { generateQRPng, generateQRSvg, downloadFile } from "@/lib/qr";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   QRPreview — generates + displays a QR code for any URL.
   Uses PNG data URL via the qrcode lib; no canvas needed.
------------------------------------------------------------------ */

interface QRPreviewProps {
  url: string;
  label: string;
  size?: number;
  showDownload?: boolean;
  variant?: "default" | "minimal";
}

export function QRPreview({ 
  url, 
  label, 
  size = 140, 
  showDownload = true,
  variant = "default"
}: QRPreviewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDataUrl(null);
    generateQRPng(url).then(setDataUrl);
  }, [url]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    downloadFile(dataUrl, label, "png");
  };

  const handleDownloadSvg = async () => {
    const svg = await generateQRSvg(url);
    downloadFile(svg, label, "svg");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMinimal = variant === "minimal";

  return (
    <div 
      className={cn("flex flex-col items-center gap-2", isMinimal && "opacity-70 rounded-lg p-1 bg-[#f8f7f5]")}
    >
      {/* QR image */}
      <div
        className={cn(
          "overflow-hidden flex-shrink-0",
          isMinimal ? "bg-transparent" : "rounded-xl border border-[#e8e6e2] bg-white"
        )}
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img 
            src={dataUrl} 
            alt={`QR code for ${label}`} 
            width={size} 
            height={size} 
            className={cn(isMinimal ? "mix-blend-multiply" : "")}
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-[#f5f3f0]" />
        )}
      </div>

      {/* Label (only in default) */}
      {!isMinimal && (
        <p className="text-[11px] font-mono text-[#8a8a9a]">{label}</p>
      )}

      {showDownload && !isMinimal && (
        <>
          {/* Download buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={handleDownloadPng}
              disabled={!dataUrl}
              className="px-3 py-1 rounded-full border border-[#e8e6e2] text-[11px] text-[#1a1a2e] hover:bg-[#f5f3f0] transition-colors disabled:opacity-40"
            >
              PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              disabled={!dataUrl}
              className="px-3 py-1 rounded-full border border-[#e8e6e2] text-[11px] text-[#1a1a2e] hover:bg-[#f5f3f0] transition-colors disabled:opacity-40"
            >
              SVG
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="text-[11px] text-[#8a8a9a] hover:text-[#1a1a2e] transition-colors"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </>
      )}
    </div>
  );
}
