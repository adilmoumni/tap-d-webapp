/* ------------------------------------------------------------------
   Platform definitions — shared across AddLinkPopup, link cards,
   and the public bio page renderer.
------------------------------------------------------------------ */

export interface PlatformDef {
  name: string;
  slug: string;
  /** Default URL prefix (user appends their handle) */
  urlPrefix: string;
  /** Path to SVG in /public/social_media_svg/ */
  svgPath: string;
  /** Background color for the icon badge */
  bg: string;
}

export const PLATFORMS: PlatformDef[] = [
  { name: "Instagram",     slug: "instagram",     urlPrefix: "https://instagram.com/",     svgPath: "/social_media_svg/instagram.svg",        bg: "#fce8f0" },
  { name: "TikTok",        slug: "tiktok",        urlPrefix: "https://tiktok.com/@",       svgPath: "/social_media_svg/tiktok.svg",           bg: "#eeedfe" },
  { name: "YouTube",       slug: "youtube",       urlPrefix: "https://youtube.com/@",      svgPath: "/social_media_svg/youtube.svg",          bg: "#fef2f2" },
  { name: "Twitter / X",   slug: "twitter",       urlPrefix: "https://x.com/",             svgPath: "/social_media_svg/x-twitter.svg",        bg: "#e8f0fc" },
  { name: "Spotify",       slug: "spotify",       urlPrefix: "https://open.spotify.com/",  svgPath: "/social_media_svg/spotify.svg",          bg: "#e1f5ee" },
  { name: "Apple Podcasts", slug: "apple-podcasts", urlPrefix: "https://podcasts.apple.com/", svgPath: "/social_media_svg/apple-podcarsts.svg", bg: "#fce8f0" },
  { name: "WhatsApp",      slug: "whatsapp",      urlPrefix: "https://wa.me/",             svgPath: "/social_media_svg/whatsapp.svg",         bg: "#e1f5ee" },
  { name: "Telegram",      slug: "telegram",      urlPrefix: "https://t.me/",              svgPath: "/social_media_svg/telegram.svg",         bg: "#e8f0fc" },
  { name: "LinkedIn",      slug: "linkedin",      urlPrefix: "https://linkedin.com/in/",   svgPath: "/social_media_svg/linkedin.svg",         bg: "#e8f0fc" },
  { name: "GitHub",        slug: "github",        urlPrefix: "https://github.com/",        svgPath: "/social_media_svg/github.svg",           bg: "#f0eeea" },
  { name: "Discord",       slug: "discord",       urlPrefix: "https://discord.gg/",        svgPath: "/social_media_svg/discord.svg",          bg: "#eeedfe" },
  { name: "Snapchat",      slug: "snapchat",      urlPrefix: "https://snapchat.com/add/",  svgPath: "/social_media_svg/snapchat.svg",         bg: "#faeeda" },
  { name: "Pinterest",     slug: "pinterest",     urlPrefix: "https://pinterest.com/",     svgPath: "/social_media_svg/pinterest.svg",        bg: "#fef2f2" },
  { name: "Twitch",        slug: "twitch",        urlPrefix: "https://twitch.tv/",         svgPath: "/social_media_svg/twitch.svg",           bg: "#eeedfe" },
  { name: "Facebook",      slug: "facebook",      urlPrefix: "https://facebook.com/",      svgPath: "/social_media_svg/facebook.svg",         bg: "#e8f0fc" },
  { name: "Reddit",        slug: "reddit",        urlPrefix: "https://reddit.com/u/",      svgPath: "/social_media_svg/reddit.svg",           bg: "#fef2f2" },
  { name: "Threads",       slug: "threads",       urlPrefix: "https://threads.net/@",      svgPath: "/social_media_svg/threads.svg",          bg: "#f0eeea" },
  { name: "Medium",        slug: "medium",        urlPrefix: "https://medium.com/@",       svgPath: "/social_media_svg/medium.svg",           bg: "#f0eeea" },
  { name: "Behance",       slug: "behance",       urlPrefix: "https://behance.net/",       svgPath: "/social_media_svg/behance.svg",          bg: "#e8f0fc" },
  { name: "Dribbble",      slug: "dribbble",      urlPrefix: "https://dribbble.com/",      svgPath: "/social_media_svg/dribbble.svg",         bg: "#fce8f0" },
  { name: "Slack",         slug: "slack",          urlPrefix: "https://slack.com/",         svgPath: "/social_media_svg/slack.svg",            bg: "#faeeda" },
];

/** Lookup by name (case-insensitive, handles "Twitter / X" variants) */
export function findPlatform(name: string): PlatformDef | null {
  const key = name.toLowerCase().trim();
  return (
    PLATFORMS.find((p) => p.name.toLowerCase() === key) ??
    PLATFORMS.find((p) => p.slug === key) ??
    PLATFORMS.find((p) => key.includes(p.slug)) ??
    null
  );
}
