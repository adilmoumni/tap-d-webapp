import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { detectDevice, getRedirectUrl } from "@/lib/device";

const RESERVED = new Set([
  "dashboard",
  "login",
  "signup",
  "api",
  "settings",
  "pricing",
  "bio",
  "b",
  "d",
  "_next",
  "favicon.ico",
  "robots.txt"
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug;
    
    // Skip reserved paths
    if (RESERVED.has(slug)) {
      return NextResponse.next();
    }
    
    const linkDocRef = doc(db, "links", slug);
    const linkSnap = await getDoc(linkDocRef);

    if (!linkSnap.exists()) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    const data = linkSnap.data() || {};

    if (data.isActive === false) {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }

    let targetUrl = data.fallbackUrl || "/";

    if (data.isSmart) {
      const userAgent = request.headers.get("user-agent") || "";
      const platform = detectDevice(userAgent);
      targetUrl = getRedirectUrl(platform, data.iosUrl, data.androidUrl, data.fallbackUrl);
    }

    // Fire-and-forget click tracking
    const platformToTrack = data.isSmart ? detectDevice(request.headers.get("user-agent") || "") : "desktop";
    trackClick(slug, request, platformToTrack).catch((err) => {
      console.error("Failed to track click for slug", slug, ":", err);
    });

    // Make sure we have a valid absolute URL for redirect
    let safeUrl = targetUrl;
    if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
      if (safeUrl.startsWith("/")) {
         safeUrl = new URL(safeUrl, request.url).toString();
      } else {
         safeUrl = "https://" + safeUrl;
      }
    }

    return NextResponse.redirect(safeUrl, { status: 302 });
  } catch (error) {
    console.error("Error in redirect route:", error);
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }
}

async function trackClick(slug: string, request: NextRequest, platform: string) {
  const linkRef = doc(db, "links", slug);
  const dateObj = new Date();
  const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
  const statsRef = doc(db, `links/${slug}/stats`, dateStr);

  const country = request.headers.get("x-vercel-ip-country") || 
                  request.headers.get("cf-ipcountry") || 
                  "unknown";
                  
  const referer = request.headers.get("referer") || "direct";
  
  let refererDomain = "direct";
  if (referer !== "direct") {
    try {
      const url = new URL(referer);
      refererDomain = url.hostname;
    } catch {
      refererDomain = "unknown";
    }
  }

  const platformKey = `${platform}Clicks`;

  const linkUpdate = updateDoc(linkRef, {
    clicks: increment(1)
  }).catch((err) => console.error("Error updating link clicks:", err));

  const statsUpdate = setDoc(statsRef, {
    clicks: increment(1),
    [platformKey]: increment(1),
    countries: {
      [country]: increment(1)
    },
    referrers: {
      [refererDomain.replace(/\./g, "_")]: increment(1)
    }
  }, { merge: true }).catch((err) => console.error("Error updating stats:", err));

  await Promise.all([linkUpdate, statsUpdate]);
}
