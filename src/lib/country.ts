export const UNKNOWN_COUNTRY = "unknown";

const COUNTRY_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function normalizeCountryCode(value?: string | null): string {
  if (!value) return UNKNOWN_COUNTRY;

  const trimmed = String(value).trim();
  if (!trimmed) return UNKNOWN_COUNTRY;

  const upper = trimmed.toUpperCase();
  if (upper === "UNKNOWN" || upper === "UNDEFINED" || upper === "NULL") {
    return UNKNOWN_COUNTRY;
  }

  const lettersOnly = upper.replace(/[^A-Z]/g, "");
  if (lettersOnly.length !== 2) return UNKNOWN_COUNTRY;

  return lettersOnly;
}

export function countryDisplayName(value?: string | null): string {
  const code = normalizeCountryCode(value);
  if (code === UNKNOWN_COUNTRY) return "Unknown";
  return COUNTRY_NAMES?.of(code) ?? code;
}

export function countryFlagEmoji(value?: string | null): string {
  const code = normalizeCountryCode(value);
  if (code === UNKNOWN_COUNTRY) return "🌍";
  const codePoints = code
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function mergeCountryCounts(
  ...maps: Array<Record<string, number> | null | undefined>
): Record<string, number> {
  const out: Record<string, number> = {};

  for (const map of maps) {
    if (!map) continue;

    for (const [rawKey, rawCount] of Object.entries(map)) {
      const count = Number(rawCount);
      if (!Number.isFinite(count) || count <= 0) continue;

      const key = normalizeCountryCode(rawKey);
      out[key] = (out[key] ?? 0) + count;
    }
  }

  return out;
}
