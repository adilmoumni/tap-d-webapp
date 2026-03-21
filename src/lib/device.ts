/* ------------------------------------------------------------------
   Device detection from User-Agent string.
   Used by the [slug] route to pick the right redirect URL.
------------------------------------------------------------------ */

export type DeviceType = "ios" | "android" | "desktop";

export function detectDevice(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
