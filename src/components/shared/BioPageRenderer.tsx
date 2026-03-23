"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { BioPageData, BioTheme, BioLink } from "@/types/bio";
import { findPlatform } from "@/lib/platforms";
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

/* ── Hero header heights ── */

const HERO_HEIGHT: Record<Variant, string> = {
  phone: "200px",
  full: "300px",
  public: "360px",
};

/* ── Priority animation CSS classes ── */

const PRIORITY_ANIMATIONS = `
@keyframes tap-buzz {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-3px); }
  20% { transform: translateX(3px); }
  30% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  70% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}
@keyframes tap-wobble {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-3deg); }
  30% { transform: rotate(2.5deg); }
  45% { transform: rotate(-2deg); }
  60% { transform: rotate(1.5deg); }
  75% { transform: rotate(-1deg); }
}
@keyframes tap-pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes tap-swipe {
  0%, 100% { transform: translateX(0); opacity: 1; }
  40% { transform: translateX(6px); opacity: 0.85; }
  60% { transform: translateX(-2px); }
}
`;

const ANIM_MAP: Record<string, string> = {
  buzz: "tap-buzz 0.8s ease-in-out infinite",
  wobble: "tap-wobble 1s ease-in-out infinite",
  pop: "tap-pop 1.5s ease-in-out infinite",
  swipe: "tap-swipe 1.2s ease-in-out infinite",
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

  // Check for redirect-priority link (public only)
  const hasAnimations = (data.links ?? []).some(
    (l) => l.isVisible && l.prioritize === "animate"
  );

  useEffect(() => {
    if (!isPublic) return;
    const redirectLink = (data.links ?? []).find((l) => {
      if (!l.isVisible || l.prioritize !== "redirect") return false;
      if (l.redirectUntil) {
        return new Date() < new Date(l.redirectUntil);
      }
      return true; // no end date = always active
    });
    if (redirectLink) {
      const href = redirectLink.fallbackUrl || redirectLink.url;
      if (href) {
        trackClick(data.username, redirectLink.id);
        window.location.href = href;
      }
    }
  }, [isPublic, data.links, data.username]);

  const avatarSize = isHero ? HERO_AVATAR[variant] : sizes.avatarSize;
  const nameSize = isLargeTitle
    ? `calc(${sizes.nameSize} * 1.35)`
    : sizes.nameSize;

  // Filter visible links, sorted by order
  // On public pages, also enforce schedule windows
  const now = isPublic ? new Date() : null;
  const visibleLinks = (data.links ?? [])
    .filter((l) => {
      if (!l.isVisible) return false;
      if (isPublic && l.scheduleStart) {
        const start = new Date(l.scheduleStart);
        if (now! < start) return false;
        if (l.scheduleEnd) {
          const end = new Date(l.scheduleEnd);
          if (now! > end) return false;
        }
      }
      return true;
    })
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
      {/* Priority animation keyframes */}
      {hasAnimations && (
        <style dangerouslySetInnerHTML={{ __html: PRIORITY_ANIMATIONS }} />
      )}
      {/* ── Hero header background (profile image, blur only at bottom) ── */}
      {isHero && (
        <div
          className="relative overflow-hidden self-stretch"
          style={{
            height: HERO_HEIGHT[variant],
            borderRadius: "0 0 28px 28px",
          }}
        >
          {data.avatarUrl ? (
            <>
              {/* Sharp profile image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.avatarUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Subtle gradient fade at bottom */}
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{
                  height: "40%",
                  background: `linear-gradient(180deg, transparent 0%, ${theme.backgroundColor} 100%)`,
                }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${theme.accentColor}55, ${theme.accentColor}22)`,
              }}
            />
          )}
        </div>
      )}

      {/* ── Avatar (classic only — hero uses background image instead) ── */}
      {!isHero && (
        <Wrap
          {...(isPublic ? fadeUp : {})}
          className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10"
          style={{
            width: avatarSize,
            height: avatarSize,
            background: theme.accentColor + "22",
            border: isPublic
              ? `3px solid ${theme.backgroundColor}`
              : `2px solid ${theme.buttonColor}`,
            boxShadow: isPublic
              ? `0 0 0 2px ${theme.accentColor}44, 0 4px 20px rgba(0,0,0,0.1)`
              : undefined,
            marginTop: sizes.pt,
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
      )}

      {/* ── Display Name ── */}
      <Wrap
        {...(isPublic ? fadeUp : {})}
        className="text-center font-bold"
        style={{
          fontSize: nameSize,
          marginTop: isHero
            ? (variant === "phone" ? "-4px" : "-2px")
            : (variant === "phone" ? "6px" : "12px"),
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
          {data.socialLinks.map((s) => {
            const plat = findPlatform(s.platform);
            const iconSize = parseInt(sizes.socialSize) * 0.5;
            return (
              <a
                key={s.platform}
                href={isPublic ? s.url : undefined}
                target={isPublic ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="rounded-full flex items-center justify-center font-bold transition-transform hover:scale-105 overflow-hidden"
                style={{
                  width: sizes.socialSize,
                  height: sizes.socialSize,
                  fontSize: sizes.socialFont,
                  background: theme.buttonColor,
                  color: theme.buttonTextColor,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {plat ? (
                  <Image src={plat.svgPath} alt={plat.name} width={iconSize} height={iconSize} />
                ) : (
                  socialLabel(s.platform)
                )}
              </a>
            );
          })}
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

      {/* ── Footer ── */}
      {(theme.showBranding || theme.showJoinCta) && (
        <div
          className="flex flex-col items-center gap-3 w-full"
          style={{
            marginTop: variant === "phone" ? "20px" : "32px",
            marginBottom: variant === "phone" ? "8px" : isPublic ? "0px" : "24px",
            padding: `0 ${sizes.px}`,
          }}
        >
          {/* Divider */}
          <div
            className="w-full"
            style={{
              maxWidth: sizes.linkMax,
              height: "1px",
              background: theme.textColor + "12",
              marginBottom: variant === "phone" ? "4px" : "8px",
            }}
          />

          {theme.showJoinCta && (
            <a
              href={isPublic ? "/signup" : undefined}
              className="w-full transition-all hover:opacity-90"
              style={{
                maxWidth: sizes.linkMax,
                textDecoration: "none",
                display: "block",
              }}
            >
              <div
                className="w-full rounded-full flex items-center justify-center font-semibold"
                style={{
                  padding: `${variant === "phone" ? "8px" : "12px"} ${sizes.linkPx}`,
                  fontSize: variant === "phone" ? "10px" : "13px",
                  background: theme.textColor + "0a",
                  color: theme.textColor,
                  border: `1px solid ${theme.textColor}15`,
                }}
              >
                Join {data.displayName} on tap-d.link
              </div>
            </a>
          )}

          {theme.showBranding && (
            <a
              href={isPublic ? "/" : undefined}
              className="flex items-center justify-center gap-1.5 opacity-35 hover:opacity-55 transition-opacity"
              style={{
                fontSize: sizes.brandingFont,
                color: theme.textColor,
                textDecoration: "none",
                marginTop: theme.showJoinCta ? "0px" : "4px",
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
        </div>
      )}
    </div>
  );
}

/* ── Link card sub-component ── */

/* ── Lock overlay modal ── */

function LockModal({
  link,
  theme,
  onUnlock,
  onClose,
}: {
  link: BioLink;
  theme: BioTheme;
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const lockType = link.lockType ?? "none";

  const handleSubmit = () => {
    if (lockType === "code") {
      if (input === link.lockCode) {
        onUnlock();
      } else {
        setError("Incorrect code. Please try again.");
        setInput("");
      }
    } else if (lockType === "password") {
      if (input === link.lockPassword) {
        onUnlock();
      } else {
        setError("Incorrect password. Please try again.");
        setInput("");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-[20px] p-6 space-y-4"
        style={{ background: theme.backgroundColor, color: theme.textColor }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock icon */}
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: theme.accentColor + "22" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-[16px] font-bold">{link.title}</h3>
          <p className="text-[13px] opacity-60 mt-1">
            {lockType === "code" && "Enter the code to access this link."}
            {lockType === "password" && "Enter the password to access this link."}
            {lockType === "sensitive" && "This link may contain content that is not appropriate for all audiences."}
          </p>
        </div>

        {/* Code / Password input */}
        {(lockType === "code" || lockType === "password") && (
          <div className="space-y-2">
            <input
              autoFocus
              type={lockType === "password" ? "password" : "text"}
              inputMode={lockType === "code" ? "numeric" : undefined}
              placeholder={lockType === "code" ? "Enter code" : "Enter password"}
              value={input}
              onChange={(e) => {
                setInput(lockType === "code" ? e.target.value.replace(/\D/g, "") : e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-3 rounded-[12px] border text-[14px] outline-none transition-colors"
              style={{
                borderColor: error ? "#ef4444" : theme.textColor + "20",
                background: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: lockType === "code" ? "monospace" : "inherit",
                letterSpacing: lockType === "code" ? "0.2em" : undefined,
                textAlign: lockType === "code" ? "center" : undefined,
              }}
            />
            {error && (
              <p className="text-[12px] text-center" style={{ color: "#ef4444" }}>{error}</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {lockType === "sensitive" ? (
            <button
              onClick={onUnlock}
              className="w-full py-3 rounded-[12px] text-[14px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: theme.accentColor, color: "#fff" }}
            >
              I understand, continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input}
              className="w-full py-3 rounded-[12px] text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: theme.accentColor, color: "#fff" }}
            >
              Unlock
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-[12px] text-[13px] font-medium opacity-50 hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
        </div>
      </div>
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
  const [showLock, setShowLock] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const isLocked = isPublic && !unlocked && !!link.lockType && link.lockType !== "none";

  // Smart links → device-detect redirect via /slug
  // Regular links → direct to fallbackUrl in new tab
  const href = isPublic
    ? link.isSmart
      ? `/${link.slug}`
      : link.fallbackUrl || link.url || "#"
    : undefined;

  const target = isPublic && !link.isSmart ? "_blank" : undefined;
  const rel = target ? "noopener noreferrer" : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (!isPublic) return;

    if (isLocked) {
      e.preventDefault();
      setShowLock(true);
      return;
    }

    trackClick(username, link.id);
  };

  const handleUnlock = () => {
    setUnlocked(true);
    setShowLock(false);
    trackClick(username, link.id);
    // Navigate after unlock
    if (href) {
      if (target === "_blank") {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
    }
  };

  // Priority animation
  const isPrioritized = link.prioritize === "animate";
  const animStyle = isPrioritized && link.animationType
    ? { animation: ANIM_MAP[link.animationType] ?? undefined }
    : undefined;

  const isFeatured = link.layout === "featured";
  const featuredImg = link.thumbnailUrl || (() => {
    const plat = findPlatform(link.title) ?? findPlatform(link.icon ?? "");
    return plat?.svgPath ?? null;
  })();

  if (isFeatured) {
    // ── Featured layout: large card with image ──
    const radius = variant === "phone" ? "10px" : "16px";
    return (
      <>
        <LinkWrap
          {...(isPublic ? fadeUp : {})}
          href={isLocked ? undefined : href}
          target={isLocked ? undefined : target}
          rel={isLocked ? undefined : rel}
          onClick={handleClick}
          className={`w-full overflow-hidden transition-all duration-200 ${isPublic ? "hover:-translate-y-1 hover:shadow-lg" : ""}`}
          style={{
            ...btnStyle,
            padding: 0,
            borderRadius: radius,
            textDecoration: "none",
            cursor: isPublic ? "pointer" : "default",
            display: "block",
            ...animStyle,
          }}
        >
          {/* Hero image */}
          {featuredImg && (
            <div
              className="w-full overflow-hidden"
              style={{
                height: variant === "phone" ? "80px" : variant === "full" ? "120px" : "160px",
                background: link.thumbnailUrl ? undefined : (findPlatform(link.title)?.bg ?? theme.accentColor + "22"),
              }}
            >
              {link.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={featuredImg}
                    alt=""
                    width={variant === "phone" ? 32 : 48}
                    height={variant === "phone" ? 32 : 48}
                    className="opacity-60"
                  />
                </div>
              )}
            </div>
          )}

          {/* Title bar */}
          <div
            className="flex items-center gap-2 w-full"
            style={{
              padding: `${variant === "phone" ? "8px" : "12px"} ${sizes.linkPx}`,
              fontSize: sizes.linkFont,
              fontWeight: 600,
            }}
          >
            {isLocked && (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={btnStyle.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            <span className="flex-1 truncate">{link.title}</span>
            {link.isSmart && (
              <span
                className="uppercase tracking-widest flex-shrink-0 rounded-full font-extrabold"
                style={{ fontSize: sizes.badgeFont, padding: "2px 7px", background: theme.accentColor + "22", color: theme.accentColor }}
              >
                Smart
              </span>
            )}
          </div>
        </LinkWrap>

        {showLock && (
          <LockModal link={link} theme={theme} onUnlock={handleUnlock} onClose={() => setShowLock(false)} />
        )}
      </>
    );
  }

  // ── Classic layout ──
  return (
    <>
      <LinkWrap
        {...(isPublic ? fadeUp : {})}
        href={isLocked ? undefined : href}
        target={isLocked ? undefined : target}
        rel={isLocked ? undefined : rel}
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
          ...animStyle,
        }}
      >
        {/* Lock indicator */}
        {isLocked && (
          <svg
            width={variant === "phone" ? 12 : 14}
            height={variant === "phone" ? 12 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={btnStyle.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: variant === "phone" ? "6px" : "8px", opacity: 0.5, flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}

        {/* Thumbnail or platform icon */}
        {(() => {
          const imgSize = variant === "phone" ? 24 : 36;
          const mr = variant === "phone" ? "8px" : "12px";

          if (link.thumbnailUrl) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.thumbnailUrl}
                alt=""
                className="rounded-md flex-shrink-0 object-cover"
                style={{ width: imgSize, height: imgSize, marginRight: mr }}
              />
            );
          }

          const plat = findPlatform(link.title) ?? findPlatform(link.icon ?? "");
          if (plat) {
            return (
              <div
                className="rounded-md flex-shrink-0 flex items-center justify-center"
                style={{ width: imgSize, height: imgSize, marginRight: mr, background: plat.bg }}
              >
                <Image src={plat.svgPath} alt={plat.name} width={Math.round(imgSize * 0.6)} height={Math.round(imgSize * 0.6)} />
              </div>
            );
          }

          if (link.icon) {
            return (
              <div
                className="rounded-md flex-shrink-0 flex items-center justify-center text-[16px]"
                style={{ width: imgSize, height: imgSize, marginRight: mr, background: theme.accentColor + "15" }}
              >
                {link.icon}
              </div>
            );
          }

          return null;
        })()}

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

      {/* Lock modal */}
      {showLock && (
        <LockModal
          link={link}
          theme={theme}
          onUnlock={handleUnlock}
          onClose={() => setShowLock(false)}
        />
      )}
    </>
  );
}
