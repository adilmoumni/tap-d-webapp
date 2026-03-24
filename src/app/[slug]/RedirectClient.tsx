"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { detectDevice, getRedirectUrl } from "@/lib/device";
import { logClickClient } from "@/lib/db-client";
import { Logo } from "@/components/shared/Logo";
import { buildSafeOutgoingHref, normalizeOutboundUrl } from "@/lib/url-safety";

export default function RedirectClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => {
    if (!pathname) return null;
    return pathname.split("/").pop() || null;
  }, [pathname]);

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

        const normalizedTarget = normalizeOutboundUrl(targetUrl, { allowRelative: true });
        if (!normalizedTarget) {
          setError("Destination blocked for safety. Redirecting to home...");
          setTimeout(() => window.location.replace("/"), 2000);
          return;
        }

        const safeHref = buildSafeOutgoingHref(normalizedTarget, {
          allowRelative: true,
          origin: window.location.origin,
          source: "smart",
          slug,
        });

        if (!safeHref) {
          setError("Destination blocked for safety. Redirecting to home...");
          setTimeout(() => window.location.replace("/"), 2000);
          return;
        }

        window.location.replace(safeHref);
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
          <p className="text-text-muted">Just a moment, we&apos;re taking you to your destination.</p>
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
