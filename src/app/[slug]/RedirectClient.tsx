"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { detectDevice, getRedirectUrl } from "@/lib/device";
import { logClickClient } from "@/lib/db-client";
import { Logo } from "@/components/shared/Logo";

export default function RedirectClient() {
  const [slug, setSlug] = useState<string | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const currentSlug = path.split("/").pop() || "";
      setSlug(currentSlug);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;

    async function handleRedirect() {
      if (!slug) return;
      try {
        const linkDocRef = doc(db, "links", slug);
        const linkSnap = await getDoc(linkDocRef);

        if (!linkSnap.exists()) {
          router.replace("/");
          return;
        }

        const data = linkSnap.data();
        if (data.isActive === false) {
          router.replace("/");
          return;
        }

        let targetUrl = data.fallbackUrl || "/";
        const userAgent = navigator.userAgent;
        const platform = detectDevice(userAgent);

        if (data.isSmart) {
          targetUrl = getRedirectUrl(platform, data.iosUrl, data.androidUrl, data.fallbackUrl);
        }

        // Track click on the client side
        logClickClient({
          linkId: slug,
          uid: data.uid,
          device: platform,
          referrer: document.referrer || "direct",
        }).catch((err: unknown) => console.error("Analytics error:", err));

        // Perform redirect
        if (!targetUrl.startsWith("http")) {
          if (targetUrl.startsWith("/")) {
            targetUrl = `${window.location.origin}${targetUrl}`;
          } else {
            // If it's something like "google.com", ensure it has https://
            targetUrl = `https://${targetUrl}`;
          }
        }
        
        // Final sanity check for malformed internal URLs
        if (targetUrl.includes("tap-d-link") && !targetUrl.includes(".")) {
           targetUrl = targetUrl.replace("tap-d-link", "tap-d.link");
        }

        window.location.replace(targetUrl);
      } catch (err: unknown) {
        console.error("Redirect error:", err);
        setError("Something went wrong. Redirecting to home...");
        setTimeout(() => window.location.replace("/"), 2000);
      }
    }

    handleRedirect();
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 animate-pulse">
        <Logo size="lg" />
      </div>
      
      {error ? (
        <p className="text-error font-medium">{error}</p>
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-text-primary">Redirecting you...</h1>
          <p className="text-text-muted">Just a moment, we're taking you to your destination.</p>
          <div className="flex justify-center gap-1.5 mt-4">
            <span className="w-2.5 h-2.5 rounded-full bg-lavender animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-lavender animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-lavender animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
