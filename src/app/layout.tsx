import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tap-d.link"),
  title: {
    default: "tap-d.link | Short Links, Bio Link Pages, Smart Links & QR Codes",
    template: "%s | tap-d.link",
  },
  description:
    "Create short links, smart links, and bio link pages in seconds. Build a quick link landing page, auto-route by device, generate QR codes, and track countries and clicks.",
  keywords: [
    "short links",
    "short link",
    "URL shortener",
    "link shortener",
    "bio link",
    "bio link page",
    "link in bio",
    "link landing page",
    "smart links",
    "deep links",
    "QR code links",
    "QR code generator",
    "tap-d",
    "tap-d link",
    "creator tools",
    "marketing links"
  ],
  authors: [{ name: "tap-d.link" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://tap-d.link",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tap-d.link",
    siteName: "tap-d.link",
    title: "tap-d.link | Short Links, Bio Link Pages, Smart Links & QR Codes",
    description:
      "Create short links, bio link pages, smart links, and QR links. Route users by device and track analytics in one dashboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tap-d.link short links and bio page platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tap-d.link | Short Links, Bio Link Pages, Smart Links & QR Codes",
    description:
      "Build short links, smart links, bio link pages, and QR code links with analytics.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "tap-d.link",
        url: "https://tap-d.link",
        logo: "https://tap-d.link/og-image.png",
      },
      {
        "@type": "WebSite",
        name: "tap-d.link",
        url: "https://tap-d.link",
        description:
          "Short links, bio link pages, smart links, and QR code links with analytics.",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // Next.js docs recommend a native script tag for JSON-LD.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0S1NZN110S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-0S1NZN110S');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
