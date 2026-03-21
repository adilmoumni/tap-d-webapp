import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLinkBySlug, getBioByUsername, getActiveLinksForUser, logClick } from "@/lib/db";
import { detectDevice } from "@/lib/device";
import { cn } from "@/lib/utils";
import type { SmartLink, BioPage } from "@/types";

/* ------------------------------------------------------------------
   Public catch-all — two cases:
   1. /@username or /username → render public bio page
   2. /slug                   → detect device, redirect, log click
   Static routes (/d/*, /login, /signup, etc.) always take priority.
------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

/* ================================================================
   Metadata
   ================================================================ */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const username = slug.startsWith("@") ? slug.slice(1) : slug;
  const bio = await getBioByUsername(username);
  if (!bio) return { title: "tap-d.link" };
  return {
    title: `${bio.displayName} (@${bio.username}) — tap-d.link`,
    description: bio.bio ?? `${bio.displayName}'s bio page on tap-d.link`,
    openGraph: {
      title: bio.displayName,
      description: bio.bio,
      images: bio.avatarUrl ? [bio.avatarUrl] : [],
    },
  };
}

/* ================================================================
   Theme helpers
   ================================================================ */
type Theme = BioPage["theme"];

const themeStyles: Record<Theme, {
  page: string;
  card: string;
  cardHover: string;
  name: string;
  bio: string;
  badge: string;
  branding: string;
  avatar: string;
}> = {
  default: {
    page:      "bg-page-bg",
    card:      "bg-surface border border-border text-text-primary",
    cardHover: "hover:bg-lavender-light hover:border-lavender hover:shadow-md hover:-translate-y-0.5",
    name:      "text-text-primary",
    bio:       "text-text-secondary",
    badge:     "bg-lavender-light text-[#6b5b95] border border-lavender/40",
    branding:  "text-text-muted",
    avatar:    "bg-lavender text-text-primary",
  },
  dark: {
    page:      "bg-dark",
    card:      "bg-dark-elevated border border-white/10 text-text-on-dark",
    cardHover: "hover:bg-dark-card hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5",
    name:      "text-text-on-dark",
    bio:       "text-white/60",
    badge:     "bg-white/10 text-white/80 border border-white/20",
    branding:  "text-white/30",
    avatar:    "bg-dark-elevated text-text-on-dark border border-white/10",
  },
  minimal: {
    page:      "bg-white",
    card:      "bg-white border border-gray-200 text-gray-900",
    cardHover: "hover:border-gray-400 hover:shadow-sm hover:-translate-y-0.5",
    name:      "text-gray-900",
    bio:       "text-gray-500",
    badge:     "bg-gray-100 text-gray-500 border border-gray-200",
    branding:  "text-gray-300",
    avatar:    "bg-gray-100 text-gray-700",
  },
};

/* ================================================================
   Bio Page component
   ================================================================ */
function BioPageView({ bio, links }: { bio: BioPage; links: SmartLink[] }) {
  const t = themeStyles[bio.theme ?? "default"];
  const initials = bio.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className={cn("min-h-screen flex flex-col items-center px-4 py-14", t.page)}>
      {/* Profile card */}
      <div className="w-full max-w-sm">
        {/* Avatar */}
        <div className="flex justify-center mb-5">
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0",
              t.avatar
            )}
          >
            {bio.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bio.avatarUrl}
                alt={bio.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold font-serif">{initials}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h1 className={cn("font-serif text-2xl font-medium text-center mb-2", t.name)}>
          {bio.displayName}
        </h1>

        {/* Username */}
        <p className={cn("text-sm text-center mb-3 font-mono opacity-60", t.name)}>
          @{bio.username}
        </p>

        {/* Bio text */}
        {bio.bio && (
          <p className={cn("text-sm text-center leading-relaxed mb-8 max-w-[260px] mx-auto", t.bio)}>
            {bio.bio}
          </p>
        )}

        {/* Links */}
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={`/${link.slug}`}
              className={cn(
                "flex items-center justify-between w-full px-5 py-4 rounded-2xl",
                "font-semibold text-sm transition-all duration-200",
                t.card,
                t.cardHover
              )}
            >
              <span>{link.title}</span>
              {link.isSmart && (
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ml-3 flex-shrink-0",
                    t.badge
                  )}
                >
                  Smart
                </span>
              )}
            </a>
          ))}

          {links.length === 0 && (
            <p className={cn("text-center text-sm py-6 opacity-50", t.bio)}>
              No links yet.
            </p>
          )}
        </div>

        {/* Branding */}
        <div className="mt-12 flex justify-center">
          <a
            href="/"
            className={cn(
              "text-xs flex items-center gap-1.5 transition-opacity hover:opacity-80",
              t.branding
            )}
          >
            <span className="w-3 h-3 rounded-full bg-accent-pink inline-block" />
            tap-d.link
          </a>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   Smart Link redirect intermediate (graceful fallback for no-JS)
   ================================================================ */
function RedirectPage({ destination }: { destination: string }) {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      </head>
      <body>
        <p>Redirecting… <a href={destination}>Click here if not redirected.</a></p>
      </body>
    </html>
  );
}

/* ================================================================
   Page
   ================================================================ */
export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  /* ---- Bio page: /@username or /username ---- */
  const username = slug.startsWith("@") ? slug.slice(1) : slug;
  const bio = await getBioByUsername(username);

  if (bio) {
    // Fetch all active links for this user
    const links = await getActiveLinksForUser(bio.uid);
    // Respect linkIds order if set, otherwise use all
    const ordered =
      bio.linkIds?.length
        ? bio.linkIds
            .map((id) => links.find((l) => l.id === id))
            .filter(Boolean) as SmartLink[]
        : links;
    return <BioPageView bio={bio} links={ordered} />;
  }

  /* ---- Smart link: /slug → device redirect ---- */
  const link = await getLinkBySlug(slug);
  if (!link) notFound();

  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const device = detectDevice(ua);

  const destination =
    device === "ios"     && link.urlIOS     ? link.urlIOS     :
    device === "android" && link.urlAndroid ? link.urlAndroid :
    link.urlDesktop;

  // Extract geo + referrer from headers (best-effort, never blocks redirect)
  const country  = headersList.get("x-vercel-ip-country") ?? undefined;
  const refHeader = headersList.get("referer") ?? "";
  let referrer: string | undefined;
  try {
    if (refHeader) referrer = new URL(refHeader).hostname;
  } catch { /* malformed referer — ignore */ }

  // Log async — don't block the redirect
  logClick({ linkId: link.id, uid: link.uid, device, country, referrer }).catch(() => {});

  redirect(destination);
}
