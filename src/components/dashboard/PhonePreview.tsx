"use client";

import { Share2 } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { BioPageRenderer } from "@/components/shared/BioPageRenderer";
import { QRPreview } from "@/components/dashboard/qr/QRPreview";
import { generateQRPng, downloadFile } from "@/lib/qr";

/* ─────────────────────────────────────────────
   Phone Preview — wraps BioPageRenderer in a
   phone-shaped frame. Visible only on Bio section.

   Reads live editor state from BioEditorContext
   so the preview updates instantly as the user edits.
───────────────────────────────────────────── */

export function PhonePreview() {
  const { activeSection } = useDashboard();
  const { data } = useBioEditor();

  if (activeSection !== "bio") return null;

  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://tap-d.link";
  const domainWithoutProtocol = domain.replace("https://", "").replace("http://", "");
  const slug = data.slug || "";
  const bioUrl = slug ? `${domain}/${slug}` : null;
  const bioLabel = slug ? slug : "your-slug";

  return (
    <aside className="w-[360px] flex-shrink-0 bg-[#f5f3f0] border-l border-[#e8e6e2] flex flex-col items-center px-4 py-5 overflow-y-auto">
      {/* URL bar */}
      <a
        className="flex items-center gap-2 w-full px-3.5 py-[7px] bg-white border border-[#e8e6e2] rounded-full text-[11px] text-[#1a1a2e] mb-4 shadow-sm"
        href={`${domain}/${slug}`}
        target="_blank"
      >
        <span className="font-medium">{domainWithoutProtocol}/{slug}</span>
        <Share2 size={14} className="ml-auto opacity-30 cursor-pointer flex-shrink-0" />
      </a>

      {/* Phone frame */}
      <div
        className="w-[260px] bg-white rounded-[30px] border border-[#e8e6e2] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
      >
        <div className={data.theme?.headerLayout === "hero" ? "s" : ""}>
          <BioPageRenderer data={data} variant="phone" />
        </div>
      </div>

      {/* Bio QR section — below phone frame */}
      {bioUrl && (
        <BioQRSection url={bioUrl} label={bioLabel} />
      )}
    </aside>
  );
}

/* ── Small Bio QR card shown below the phone frame ── */
function BioQRSection({ url, label }: { url: string; label: string }) {
  const handleDownload = async () => {
    const png = await generateQRPng(url);
    downloadFile(png, label, "png");
  };

  return (
    <div
      className="mt-5 w-full flex flex-col items-center gap-1 p-4 bg-white rounded-xl border border-[#e8e6e2]"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <p className="text-[10px] font-medium text-[#8a8a9a] uppercase tracking-wider mb-2">
        Bio page QR
      </p>
      <QRPreview url={url} label={label} size={80} showDownload={false} />
      <button
        onClick={handleDownload}
        className="text-[11px] font-medium mt-1 transition-colors"
        style={{ color: "#c99a4b" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#b8860b"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c99a4b"; }}
      >
        Download PNG
      </button>
    </div>
  );
}
