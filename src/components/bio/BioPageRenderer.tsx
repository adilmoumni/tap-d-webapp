import type { BioPageData, BioTheme } from "./types";
import { FONT_STACKS, RADIUS_MAP } from "./types";

/* ─────────────────────────────────────────────
   BioPageRenderer

   Pure rendering component — no data fetching.
   Works at any width: 260px phone preview, 420px
   full preview, or full-screen public page.
   The parent sizes the container; this fills it.

   Theming is done via CSS custom properties set on
   the root wrapper so every child inherits them.
───────────────────────────────────────────── */

/* ── helpers ── */

function resolveButtonStyles(theme: BioTheme) {
  const radius = RADIUS_MAP[theme.buttonRadius];

  if (theme.buttonStyle === "outline") {
    return {
      background: "transparent",
      border: `1.5px solid ${theme.textColor}`,
      borderRadius: radius,
      color: theme.textColor,
      boxShadow: "none",
    } as const;
  }

  if (theme.buttonStyle === "shadow") {
    return {
      background: theme.cardBackground,
      border: `1.5px solid ${theme.textColor}`,
      borderRadius: radius,
      color: theme.textColor,
      boxShadow: `4px 4px 0 ${theme.textColor}`,
    } as const;
  }

  // filled (default)
  return {
    background: theme.cardBackground,
    border: `1px solid rgba(0,0,0,0.06)`,
    borderRadius: radius,
    color: theme.textColor,
    boxShadow: "none",
  } as const;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* Social icon mapping — letter fallback */
const SOCIAL_LETTERS: Record<string, string> = {
  instagram: "Ig",
  twitter: "X",
  tiktok: "Tk",
  youtube: "Yt",
  linkedin: "Li",
  github: "Gh",
  spotify: "Sp",
  discord: "Dc",
};

function socialLabel(platform: string) {
  return SOCIAL_LETTERS[platform.toLowerCase()] ?? platform.slice(0, 2).toUpperCase();
}

/* ── component ── */

interface BioPageRendererProps {
  data: BioPageData;
  /** When true, links open in a new tab (for previews). Default: false. */
  preview?: boolean;
  className?: string;
}

export function BioPageRenderer({ data, preview = false, className = "" }: BioPageRendererProps) {
  const { theme } = data;
  const bodyFont = FONT_STACKS[theme.font];
  const headFont = FONT_STACKS[theme.headerFont];
  const btnStyle = resolveButtonStyles(theme);
  const linkTarget = preview ? undefined : "_self";

  return (
    <div
      className={`flex flex-col items-center w-full min-h-full m-10 ${className}`}
      style={{
        background: theme.background,
        color: theme.textColor,
        fontFamily: bodyFont,
      }}
    >
      {/* ── Avatar ── */}
      <div
        className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          width: "var(--bio-avatar, 72px)",
          height: "var(--bio-avatar, 72px)",
          background: theme.accentColor + "22",
          border: `2px solid ${theme.cardBackground}`,
          marginTop: "var(--bio-pt, 40px)",
        }}
      >
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
        ) : (
          <span
            className="font-bold"
            style={{
              fontSize: "var(--bio-avatar-text, 22px)",
              fontFamily: headFont,
              color: theme.accentColor,
            }}
          >
            {initials(data.displayName)}
          </span>
        )}
      </div>

      {/* ── Name ── */}
      <h1
        className="text-center font-bold"
        style={{
          fontFamily: headFont,
          fontSize: "var(--bio-name, 20px)",
          marginTop: "var(--bio-name-mt, 12px)",
          color: theme.textColor,
          lineHeight: 1.3,
        }}
      >
        {data.displayName}
      </h1>

      {/* ── Username ── */}
      {(theme.showUsername ?? true) && (
        <p
          className="text-center font-mono opacity-60"
          style={{
            fontSize: "var(--bio-username, 12px)",
            marginTop: 2,
            color: theme.textColor,
          }}
        >
          @{data.username}
        </p>
      )}

      {/* ── Bio text ── */}
      {data.bio && (
        <p
          className="text-center leading-relaxed mx-auto"
          style={{
            fontSize: "var(--bio-text, 13px)",
            maxWidth: "var(--bio-text-max, 280px)",
            marginTop: "var(--bio-bio-mt, 8px)",
            color: theme.mutedColor,
            padding: "0 var(--bio-px, 16px)",
          }}
        >
          {data.bio}
        </p>
      )}

      {/* ── Social links ── */}
      {data.socialLinks.length > 0 && (
        <div
          className="flex justify-center flex-wrap"
          style={{
            gap: "var(--bio-social-gap, 8px)",
            marginTop: "var(--bio-social-mt, 14px)",
          }}
        >
          {data.socialLinks.map((s) => (
            <a
              key={s.platform}
              href={preview ? undefined : s.url}
              target={preview ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="rounded-full flex items-center justify-center font-bold transition-transform hover:scale-105"
              style={{
                width: "var(--bio-social-size, 32px)",
                height: "var(--bio-social-size, 32px)",
                fontSize: "var(--bio-social-font, 10px)",
                background: theme.cardBackground,
                color: theme.textColor,
                border: `1px solid rgba(0,0,0,0.06)`,
              }}
            >
              {socialLabel(s.platform)}
            </a>
          ))}
        </div>
      )}

      {/* ── Links ── */}
      <div
        className="w-full flex flex-col"
        style={{
          gap: "var(--bio-link-gap, 10px)",
          marginTop: "var(--bio-links-mt, 18px)",
          padding: "0 var(--bio-px, 16px)",
          maxWidth: "var(--bio-link-max, 420px)",
        }}
      >
        {data.links.map((link) => (
          <a
            key={link.id}
            href={preview ? undefined : (link.slug ? `/${link.slug}` : "#")}
            target={linkTarget}
            className="flex items-center w-full transition-all duration-200 hover:-translate-y-0.5"
            style={{
              ...btnStyle,
              padding: "var(--bio-link-py, 14px) var(--bio-link-px, 18px)",
              fontSize: "var(--bio-link-font, 14px)",
              fontWeight: 600,
            }}
          >
            <span className="flex-1 truncate">{link.title}</span>
            {link.smart && (
              <span
                className="uppercase tracking-widest flex-shrink-0 rounded-full font-extrabold"
                style={{
                  fontSize: "var(--bio-badge-font, 9px)",
                  padding: "2px 7px",
                  background: theme.accentColor + "22",
                  color: theme.accentColor,
                  marginLeft: 8,
                }}
              >
                Smart
              </span>
            )}
          </a>
        ))}

        {data.links.length === 0 && (
          <p
            className="text-center py-6 opacity-40"
            style={{ fontSize: "var(--bio-link-font, 14px)", color: theme.mutedColor }}
          >
            No links yet.
          </p>
        )}
      </div>

      {/* ── Branding ── */}
      {theme.showBranding && (
        <div
          className="flex items-center justify-center gap-1.5 opacity-40"
          style={{
            marginTop: "var(--bio-branding-mt, 32px)",
            marginBottom: "var(--bio-branding-mb, 24px)",
            fontSize: "var(--bio-branding-font, 11px)",
            color: theme.mutedColor,
          }}
        >
          <span
            className="rounded-full inline-block"
            style={{
              width: "var(--bio-dot, 5px)",
              height: "var(--bio-dot, 5px)",
              background: theme.accentColor,
            }}
          />
          <span className="font-medium">tap-d.link</span>
        </div>
      )}
    </div>
  );
}
