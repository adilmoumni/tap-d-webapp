"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   QRCodeCard — generates a QR code for a given URL.
   Downloads as PNG on click.
------------------------------------------------------------------ */

interface QRCodeCardProps {
  url: string;
  title?: string;
  className?: string;
}

export function QRCodeCard({ url, title, className }: QRCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width:        256,
      margin:       2,
      color: {
        dark:  "#0a0a0f",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setError(true));
  }, [url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title ?? "qr-code"}.png`;
    a.click();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* QR frame */}
      <div className="relative">
        <div className="w-48 h-48 rounded-2xl border-2 border-border bg-white flex items-center justify-center overflow-hidden shadow-sm">
          {error ? (
            <p className="text-xs text-text-muted text-center px-4">
              Could not generate QR
            </p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR code for ${url}`}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-10 h-10 border-2 border-border rounded-lg animate-pulse bg-lavender-light" />
          )}
        </div>

        {/* Tap-d dot watermark */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-border rounded-full px-2.5 py-0.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-pink flex-shrink-0" />
          <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">tap-d.link</span>
        </div>
      </div>

      {/* URL label */}
      <p className="text-xs font-mono text-text-muted text-center break-all max-w-[200px] mt-2">
        {url}
      </p>

      {/* Download */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        disabled={!dataUrl}
      >
        <Download size={14} />
        Download PNG
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------
   QRCodeSection — full card with header, used in edit link page.
------------------------------------------------------------------ */
export function QRCodeSection({ slug, title }: { slug: string; title: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tap-d.link"}/${slug}`;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <QrCode size={18} className="text-lavender-dark" />
        <h3 className="font-semibold text-text-primary">QR Code</h3>
      </div>

      <QRCodeCard url={url} title={title} />
    </div>
  );
}
