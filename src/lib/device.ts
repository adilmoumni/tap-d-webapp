export type DevicePlatform = "ios" | "android" | "desktop";

export function detectDevice(userAgent: string): DevicePlatform {
  if (!userAgent) return "desktop";
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios";
  }
  
  if (ua.includes("android")) {
    return "android";
  }
  
  return "desktop";
}

export function getRedirectUrl(
  platform: DevicePlatform,
  iosUrl: string | undefined,
  androidUrl: string | undefined,
  fallbackUrl: string
): string {
  if (platform === "ios" && iosUrl) {
    return iosUrl;
  }
  
  if (platform === "android" && androidUrl) {
    return androidUrl;
  }
  
  return fallbackUrl;
}
