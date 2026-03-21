"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* ------------------------------------------------------------------
   QRCode – Generates a high-quality QR code with optional logo.
   Uses the 'qrcode' library for generation and canvas for rendering.
   
   Props:
   • value: The URL or data to encode
   • size: width/height in px
   • logo: boolean to show tap-d logo in center
   • className: additional container styles
------------------------------------------------------------------ */

interface QRCodeProps {
  value: string;
  size?: number;
  logo?: boolean;
  className?: string;
  color?: {
    dark?: string;
    light?: string;
  };
}

export function QRCode({ 
  value, 
  size = 200, 
  logo = true, 
  className,
  color = { dark: "#0a0a0f", light: "#ffffff" }
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderQR = async () => {
      try {
        // 1. Generate QR onto the canvas
        await QRCodeLib.toCanvas(canvasRef.current!, value, {
          width: size,
          margin: 0,
          color: {
            dark: color.dark,
            light: color.light,
          },
          errorCorrectionLevel: 'H', // High error correction needed for logo overlay
        });

        // 2. If logo requested, draw it in the center
        if (logo) {
          const ctx = canvasRef.current!.getContext("2d");
          if (!ctx) return;

          const logoSize = size * 0.22; // 22% of QR size is safe for 'H' error correction
          const center = size / 2;
          
          // Draw a white rounded box behind the logo for clarity
          ctx.fillStyle = color.light || "#ffffff";
          const boxSize = logoSize + 8;
          const boxX = center - boxSize / 2;
          const boxY = center - boxSize / 2;
          const radius = 8;

          // Simple rounded rect
          ctx.beginPath();
          ctx.moveTo(boxX + radius, boxY);
          ctx.lineTo(boxX + boxSize - radius, boxY);
          ctx.quadraticCurveTo(boxX + boxSize, boxY, boxX + boxSize, boxY + radius);
          ctx.lineTo(boxX + boxSize, boxY + boxSize - radius);
          ctx.quadraticCurveTo(boxX + boxSize, boxY + boxSize, boxX + boxSize - radius, boxY + boxSize);
          ctx.lineTo(boxX + radius, boxY + boxSize);
          ctx.quadraticCurveTo(boxX, boxY + boxSize, boxX, boxY + boxSize - radius);
          ctx.lineTo(boxX, boxY + radius);
          ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
          ctx.closePath();
          ctx.fill();

          // Draw the actual logo (icon-only)
          const logoImg = new window.Image();
          logoImg.src = "/logo/logo-icon-dark.svg";
          logoImg.onload = () => {
            ctx.drawImage(
              logoImg, 
              center - logoSize / 2, 
              center - logoSize / 2, 
              logoSize, 
              logoSize
            );
          };
        }
      } catch (err) {
        console.error("QR Code Error:", err);
      }
    };

    renderQR();
  }, [value, size, logo, color.dark, color.light]);

  return (
    <div 
      className={cn(
        "relative inline-block overflow-hidden rounded-xl bg-white shadow-soft",
        className
      )}
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
