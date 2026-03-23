import { detectDevice, getRedirectUrl } from "../device";

describe("Device Detection Module", () => {
  describe("detectDevice", () => {
    it('should detect iPhone Safari UA as "ios"', () => {
      const uaSafari = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
      expect(detectDevice(uaSafari)).toBe("ios");
    });
    
    it('should detect iPhone Chrome UA as "ios"', () => {
      const uaChrome = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/114.0.5735.99 Mobile/15E148 Safari/604.1";
      expect(detectDevice(uaChrome)).toBe("ios");
    });

    it('should detect iPad Safari UA as "ios"', () => {
      const uaSafari = "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
      expect(detectDevice(uaSafari)).toBe("ios");
    });

    it('should detect iPod UA as "ios"', () => {
      const uaIpod = "Mozilla/5.0 (iPod touch; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1";
      expect(detectDevice(uaIpod)).toBe("ios");
    });

    it('should detect Android Chrome UA as "android"', () => {
      const uaChrome = "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
      expect(detectDevice(uaChrome)).toBe("android");
    });

    it('should detect Android Samsung Browser UA as "android"', () => {
      const uaSamsung = "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/21.0 Chrome/110.0.5481.154 Mobile Safari/537.36";
      expect(detectDevice(uaSamsung)).toBe("android");
    });

    it('should detect Android Firefox UA as "android"', () => {
      const uaFirefox = "Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/113.0 Firefox/113.0";
      expect(detectDevice(uaFirefox)).toBe("android");
    });

    it('should detect Windows Chrome UA as "desktop"', () => {
      const uaWindows = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
      expect(detectDevice(uaWindows)).toBe("desktop");
    });

    it('should detect macOS Safari UA as "desktop"', () => {
      const uaMac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
      expect(detectDevice(uaMac)).toBe("desktop");
    });

    it('should detect Linux Firefox UA as "desktop"', () => {
      const uaLinux = "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0";
      expect(detectDevice(uaLinux)).toBe("desktop");
    });

    it('should fallback empty string to "desktop"', () => {
      expect(detectDevice("")).toBe("desktop");
    });

    it('should fallback Bot/crawler UA (Googlebot) to "desktop"', () => {
      const uaGooglebot = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
      expect(detectDevice(uaGooglebot)).toBe("desktop");
    });
  });

  describe("getRedirectUrl", () => {
    const fallbackUrl = "https://example.com/fallback";
    const iosUrl = "https://example.com/ios";
    const androidUrl = "https://example.com/android";

    it("should return iosUrl when platform is ios and iosUrl is provided", () => {
      expect(getRedirectUrl("ios", iosUrl, androidUrl, fallbackUrl)).toBe(iosUrl);
    });

    it("should return fallbackUrl when platform is ios but no iosUrl is provided", () => {
      expect(getRedirectUrl("ios", undefined, androidUrl, fallbackUrl)).toBe(fallbackUrl);
      expect(getRedirectUrl("ios", "", androidUrl, fallbackUrl)).toBe(fallbackUrl);
    });

    it("should return androidUrl when platform is android and androidUrl is provided", () => {
      expect(getRedirectUrl("android", iosUrl, androidUrl, fallbackUrl)).toBe(androidUrl);
    });

    it("should return fallbackUrl when platform is android but no androidUrl is provided", () => {
      expect(getRedirectUrl("android", iosUrl, undefined, fallbackUrl)).toBe(fallbackUrl);
      expect(getRedirectUrl("android", iosUrl, "", fallbackUrl)).toBe(fallbackUrl);
    });

    it("should always return fallbackUrl when platform is desktop", () => {
      expect(getRedirectUrl("desktop", iosUrl, androidUrl, fallbackUrl)).toBe(fallbackUrl);
      expect(getRedirectUrl("desktop", undefined, undefined, fallbackUrl)).toBe(fallbackUrl);
    });
  });
});
