const LOCAL_IPV4_PREFIXES = [
  "10.",
  "127.",
  "192.168.",
  "0.",
];

const DISALLOWED_HOSTS = new Set(["localhost", "::1"]);

function isPrivate172(hostname: string): boolean {
  // 172.16.0.0 -> 172.31.255.255
  const m = hostname.match(/^172\.(\d{1,3})\./);
  if (!m) return false;
  const second = Number(m[1]);
  return second >= 16 && second <= 31;
}

function looksLikeScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (DISALLOWED_HOSTS.has(host) || host.endsWith(".localhost")) return true;
  if (LOCAL_IPV4_PREFIXES.some((prefix) => host.startsWith(prefix))) return true;
  if (isPrivate172(host)) return true;
  return false;
}

export function normalizeOutboundUrl(
  raw: string,
  options?: { allowRelative?: boolean }
): string | null {
  if (typeof raw !== "string") return null;

  const value = raw.trim();
  if (!value) return null;

  // Safe relative path on this origin.
  if (options?.allowRelative && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  // Block protocol-relative values.
  if (value.startsWith("//")) return null;

  const withProtocol = looksLikeScheme(value) ? value : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (isLocalOrPrivateHost(parsed.hostname)) return null;

  return parsed.toString();
}

export function buildSafeOutgoingHref(
  raw: string,
  options?: {
    allowRelative?: boolean;
    origin?: string;
    source?: string;
    slug?: string;
    interstitialPath?: string;
  }
): string | null {
  const normalized = normalizeOutboundUrl(raw, { allowRelative: options?.allowRelative });
  if (!normalized) return null;

  // Relative path => same-origin navigation is safe.
  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (options?.origin) {
    try {
      const base = new URL(options.origin);
      const target = new URL(normalized);
      if (target.origin === base.origin) {
        return `${target.pathname}${target.search}${target.hash}`;
      }
    } catch {
      // If origin parsing fails, fallback to interstitial below.
    }
  }

  const params = new URLSearchParams({ to: normalized });
  if (options?.source) params.set("src", options.source);
  if (options?.slug) params.set("slug", options.slug);

  const path = options?.interstitialPath ?? "/out";
  return `${path}?${params.toString()}`;
}

export function getHostLabel(raw: string): string {
  const normalized = normalizeOutboundUrl(raw);
  if (!normalized) return "unknown site";
  try {
    return new URL(normalized).hostname.replace(/^www\./i, "");
  } catch {
    return "unknown site";
  }
}
