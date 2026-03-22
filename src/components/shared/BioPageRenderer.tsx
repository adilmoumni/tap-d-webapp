"use client";

import type { BioPageData, BioTheme, BioLink } from "@/types/bio";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
   BioPageRenderer — the definitive renderer.

   Used in 3 contexts via `variant`:
   • "phone"  — 260px phone preview in dashboard
   • "full"   — full-width preview panel
   • "public" — public bio page (framer-motion animations)

   Theming uses CSS custom properties set on the
   root wrapper, derived from the BioTheme object.
───────────────────────────────────────────── */

/* ── Font stacks ── */

const FONT_STACKS: Record<BioTheme["fontFamily"], string> = {
  inter: "'Inter', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

/* ── Button radius by style ── */

const RADIUS_MAP: Record<BioTheme["buttonStyle"], string> = {
  rounded: "12px",
  pill: "9999px",
  square: "4px",
};

/* ── Social icon letter fallbacks ── */

const SOCIAL_LETTERS: Record<string, string> = {
  instagram: "Ig",
  twitter: "X",
  tiktok: "Tk",
  youtube: "Yt",
  linkedin: "Li",
  github: "Gh",
  spotify: "Sp",
  discord: "Dc",
  facebook: "Fb",
  snapchat: "Sn",
  pinterest: "Pi",
  threads: "Th",
  whatsapp: "Wa",
};

function socialLabel(platform: string) {
  return SOCIAL_LETTERS[platform.toLowerCase()] ?? platform.slice(0, 2).toUpperCase();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── Resolve button styles from theme ── */

function resolveButtonStyles(theme: BioTheme) {
  const radius = RADIUS_MAP[theme.buttonStyle];

  if (theme.buttonFill === "outline") {
    return {
      background: "transparent",
      border: `1.5px solid ${theme.buttonTextColor}`,
      borderRadius: radius,
      color: theme.buttonTextColor,
      boxShadow: "none",
    } as const;
  }

  if (theme.buttonFill === "shadow") {
    return {
      background: theme.buttonColor,
      border: `1.5px solid ${theme.buttonTextColor}`,
      borderRadius: radius,
      color: theme.buttonTextColor,
      boxShadow: `4px 4px 0 ${theme.buttonTextColor}`,
    } as const;
  }

  // filled (default)
  return {
    background: theme.buttonColor,
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: radius,
    color: theme.buttonTextColor,
    boxShadow: "none",
  } as const;
}

/* ── Variant sizing ── */

type Variant = "phone" | "full" | "public";

const VARIANT_SIZES: Record<Variant, {
  avatarSize: string;
  avatarText: string;
  nameSize: string;
  usernameSize: string;
  bioSize: string;
  bioMaxWidth: string;
  socialSize: string;
  socialFont: string;
  socialGap: string;
  linkFont: string;
  linkPy: string;
  linkPx: string;
  linkGap: string;
  linkMax: string;
  badgeFont: string;
  px: string;
  pt: string;
  brandingFont: string;
}> = {
  phone: {
    avatarSize: "56px", avatarText: "18px",
    nameSize: "14px", usernameSize: "10px",
    bioSize: "10px", bioMaxWidth: "200px",
    socialSize: "26px", socialFont: "9px", socialGap: "6px",
    linkFont: "11px", linkPy: "10px", linkPx: "12px", linkGap: "6px", linkMax: "100%",
    badgeFont: "7px", px: "6px", pt: "0px", brandingFont: "9px",
  },
  full: {
    avatarSize: "80px", avatarText: "26px",
    nameSize: "22px", usernameSize: "13px",
    bioSize: "14px", bioMaxWidth: "340px",
    socialSize: "36px", socialFont: "11px", socialGap: "8px",
    linkFont: "15px", linkPy: "16px", linkPx: "20px", linkGap: "10px", linkMax: "420px",
    badgeFont: "9px", px: "20px", pt: "40px", brandingFont: "11px",
  },
  public: {
    avatarSize: "96px", avatarText: "30px",
    nameSize: "28px", usernameSize: "14px",
    bioSize: "15px", bioMaxWidth: "400px",
    socialSize: "40px", socialFont: "12px", socialGap: "10px",
    linkFont: "16px", linkPy: "18px", linkPx: "24px", linkGap: "12px", linkMax: "480px",
    badgeFont: "9px", px: "24px", pt: "48px", brandingFont: "12px",
  },
};

/* ── Large header avatar sizes ── */

const HERO_AVATAR: Record<Variant, string> = {
  phone: "80px",
  full: "110px",
  public: "130px",
};

/* ── Component ── */

/* ── Click tracker (fire-and-forget) ── */

function trackClick(username: string, linkId: string) {
  if (typeof window === "undefined") return;
  fetch("/api/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, linkId }),
  }).catch(() => {});
}

interface BioPageRendererProps {
  data: BioPageData;
  variant?: Variant;
  className?: string;
}

export function BioPageRenderer({
  data,
  variant = "public",
  className = "",
}: BioPageRendererProps) {
  const { theme } = data;
  const sizes = VARIANT_SIZES[variant];
  const font = FONT_STACKS[theme.fontFamily];
  const btnStyle = resolveButtonStyles(theme);
  const isPublic = variant === "public";
  const isHero = theme.headerLayout === "hero";
  const isLargeTitle = theme.titleSize === "large";

  const avatarSize = isHero ? HERO_AVATAR[variant] : sizes.avatarSize;
  const nameSize = isLargeTitle
    ? `calc(${sizes.nameSize} * 1.35)`
    : sizes.nameSize;

  // Filter visible links, sorted by order
  const visibleLinks = (data.links ?? [])
    .filter((l) => l.isVisible)
    .sort((a, b) => a.order - b.order);

  // Wallpaper background
  const wallpaperBg =
    theme.wallpaper === "image" && theme.wallpaperImageUrl
      ? `url(${theme.wallpaperImageUrl}) center/cover no-repeat fixed`
      : theme.wallpaper === "gradient"
        ? `linear-gradient(160deg, ${theme.accentColor}30 0%, ${theme.backgroundColor} 40%, ${theme.backgroundColor} 60%, ${theme.accentColor}18 100%)`
        : theme.backgroundColor;

  // Wrapper for optional framer-motion animation
  const Wrap = isPublic ? motion.div : "div";
  const LinkWrap = isPublic ? motion.a : "a";

  const stagger = isPublic
    ? { initial: "hidden", animate: "visible", variants: { visible: { transition: { staggerChildren: 0.06 } } } }
    : {};

  const fadeUp = isPublic
    ? { variants: { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } } }
    : {};

  return (
    <div
      className={`flex flex-col items-center w-full ${variant === "full" || variant === "phone" ? "min-h-full" : ""} ${className}`}
      style={{
        background: isPublic ? undefined : wallpaperBg,
        color: theme.textColor,
        fontFamily: font,
      }}
    >
      {/* ── Hero header background ── */}
      {isHero && (
        <div
          className="w-full"
          style={{
            height: variant === "phone" ? "60px" : variant === "full" ? "100px" : "140px",
            background: `linear-gradient(135deg, ${theme.accentColor}55, ${theme.accentColor}22)`,
            borderRadius: variant === "phone" ? "0" : "0 0 24px 24px",
          }}
        />
      )}

      {/* ── Avatar ── */}
      <Wrap
        {...(isPublic ? fadeUp : {})}
        className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          width: avatarSize,
          height: avatarSize,
          background: theme.accentColor + "22",
          border: isPublic ? `3px solid ${theme.backgroundColor}` : `2px solid ${theme.buttonColor}`,
          boxShadow: isPublic ? `0 0 0 2px ${theme.accentColor}44, 0 4px 20px rgba(0,0,0,0.1)` : undefined,
          marginTop: isHero
            ? `calc(-${avatarSize} / 2)`
            : sizes.pt,
        }}
      >
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.avatarUrl}
            alt={data.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="font-bold"
            style={{
              fontSize: sizes.avatarText,
              color: theme.accentColor,
            }}
          >
            {initials(data.displayName)}
          </span>
        )}
      </Wrap>

      {/* ── Display Name ── */}
      <Wrap
        {...(isPublic ? fadeUp : {})}
        className="text-center font-bold"
        style={{
          fontSize: nameSize,
          marginTop: variant === "phone" ? "6px" : "12px",
          color: theme.textColor,
          lineHeight: 1.3,
        }}
      >
        {data.displayName}
      </Wrap>

      {/* ── Username ── */}
      <Wrap
        {...(isPublic ? fadeUp : {})}
        className="text-center font-mono opacity-60"
        style={{
          fontSize: sizes.usernameSize,
          marginTop: "2px",
          color: theme.textColor,
        }}
      >
        @{data.username}
      </Wrap>

      {/* ── Bio text ── */}
      {data.bio && (
        <Wrap
          {...(isPublic ? fadeUp : {})}
          className="text-center leading-relaxed mx-auto"
          style={{
            fontSize: sizes.bioSize,
            maxWidth: sizes.bioMaxWidth,
            marginTop: variant === "phone" ? "4px" : "8px",
            color: theme.textColor,
            opacity: 0.7,
            padding: `0 ${sizes.px}`,
          }}
        >
          {data.bio}
        </Wrap>
      )}

      {/* ── Social links ── */}
      {data.socialLinks.length > 0 && (
        <Wrap
          {...(isPublic ? fadeUp : {})}
          className="flex justify-center flex-wrap"
          style={{
            gap: sizes.socialGap,
            marginTop: variant === "phone" ? "8px" : "14px",
          }}
        >
          {data.socialLinks.map((s) => (
            <a
              key={s.platform}
              href={isPublic ? s.url : undefined}
              target={isPublic ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-full flex items-center justify-center font-bold transition-transform hover:scale-105"
              style={{
                width: sizes.socialSize,
                height: sizes.socialSize,
                fontSize: sizes.socialFont,
                background: theme.buttonColor,
                color: theme.buttonTextColor,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {socialLabel(s.platform)}
            </a>
          ))}
        </Wrap>
      )}

      {/* ── Links ── */}
      <Wrap
        {...stagger}
        className="w-full flex flex-col mx-auto"
        style={{
          gap: sizes.linkGap,
          marginTop: variant === "phone" ? "10px" : "18px",
          padding: `0 ${sizes.px}`,
          maxWidth: sizes.linkMax,
        }}
      >
        {visibleLinks.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            theme={theme}
            btnStyle={btnStyle}
            sizes={sizes}
            variant={variant}
            isPublic={isPublic}
            fadeUp={fadeUp}
            LinkWrap={LinkWrap}
            username={data.username}
          />
        ))}

        {visibleLinks.length === 0 && (
          <p
            className="text-center py-6 opacity-40"
            style={{ fontSize: sizes.linkFont, color: theme.textColor }}
          >
            No links yet.
          </p>
        )}
      </Wrap>

      {/* ── Spacer to push footer down (non-card variants) ── */}
      {!isPublic && variant === "full" && <div className="flex-1 min-h-8" />}

      {/* ── Footer (hidden in public variant — card wrapper has its own) ── */}
      {!isPublic && (theme.showBranding || theme.showJoinCta) && (
        <div
          className="flex flex-col items-center gap-2"
          style={{
            marginTop: variant === "phone" ? "16px" : "40px",
            marginBottom: variant === "phone" ? "8px" : "32px",
            paddingBottom: undefined,
          }}
        >
          {theme.showBranding && (
            <a
              href={isPublic ? "/" : undefined}
              className="flex items-center justify-center gap-1.5 opacity-40 hover:opacity-60 transition-opacity"
              style={{
                fontSize: sizes.brandingFont,
                color: theme.textColor,
                textDecoration: "none",
              }}
            >
              <span
                className="rounded-full inline-block"
                style={{
                  width: variant === "phone" ? "4px" : "5px",
                  height: variant === "phone" ? "4px" : "5px",
                  background: theme.accentColor,
                }}
              />
              <span className="font-medium">tap-d.link</span>
            </a>
          )}

          {theme.showJoinCta && (
            <a
              href={isPublic ? "/signup" : undefined}
              className="font-semibold transition-colors hover:opacity-80"
              style={{
                fontSize: variant === "phone" ? "9px" : "11px",
                color: theme.accentColor,
                textDecoration: "none",
              }}
            >
              {isPublic
                ? `Join ${data.displayName} on tap-d.link`
                : "Create your own free bio page"}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Link card sub-component ── */

function LinkCard({
  link,
  theme,
  btnStyle,
  sizes,
  variant,
  isPublic,
  fadeUp,
  LinkWrap,
  username,
}: {
  link: BioLink;
  theme: BioTheme;
  btnStyle: ReturnType<typeof resolveButtonStyles>;
  sizes: (typeof VARIANT_SIZES)[Variant];
  variant: Variant;
  isPublic: boolean;
  fadeUp: Record<string, unknown>;
  LinkWrap: typeof motion.a | "a";
  username: string;
}) {
  // Smart links → device-detect redirect via /slug
  // Regular links → direct to fallbackUrl in new tab
  const href = isPublic
    ? link.isSmart
      ? `/${link.slug}`
      : link.fallbackUrl || link.url || "#"
    : undefined;

  const target = isPublic && !link.isSmart ? "_blank" : undefined;
  const rel = target ? "noopener noreferrer" : undefined;

  const handleClick = isPublic
    ? () => trackClick(username, link.id)
    : undefined;

  return (
    <LinkWrap
      {...(isPublic ? fadeUp : {})}
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      className={`flex items-center justify-center w-full transition-all duration-200 ${isPublic ? "hover:-translate-y-1 hover:shadow-lg" : ""}`}
      style={{
        ...btnStyle,
        padding: `${sizes.linkPy} ${sizes.linkPx}`,
        fontSize: sizes.linkFont,
        fontWeight: 600,
        textDecoration: "none",
        cursor: isPublic ? "pointer" : "default",
        textAlign: "center" as const,
      }}
    >
      {/* Thumbnail */}
      {link.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.thumbnailUrl}
          alt=""
          className="rounded-md flex-shrink-0 object-cover"
          style={{
            width: variant === "phone" ? "24px" : "36px",
            height: variant === "phone" ? "24px" : "36px",
            marginRight: variant === "phone" ? "8px" : "12px",
          }}
        />
      )}

      <span className="flex-1 truncate">{link.title}</span>

      {link.isSmart && (
        <span
          className="uppercase tracking-widest flex-shrink-0 rounded-full font-extrabold"
          style={{
            fontSize: sizes.badgeFont,
            padding: "2px 7px",
            background: theme.accentColor + "22",
            color: theme.accentColor,
            marginLeft: "8px",
          }}
        >
          Smart
        </span>
      )}
    </LinkWrap>
  );
}
