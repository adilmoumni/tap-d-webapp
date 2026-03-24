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
    default: "tap-d.link — Premium Smart Links & Bio Pages",
    template: "%s | tap-d.link",
  },
  description:
    "The world's most elegant smart link platform. Automatically redirect users based on their device. Create stunning bio pages in seconds.",
  keywords: [
    "smart links", 
    "deep links", 
    "bio page", 
    "link in bio", 
    "URL shortener",
    "tap-d",
    "tap-d link",
    "marketing automation",
    "digital branding"
  ],
  authors: [{ name: "tap-d.link" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://tap-d.link",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tap-d.link",
    siteName: "tap-d.link",
    title: "tap-d.link — Premium Smart Links & Bio Pages",
    description:
      "The world's most elegant smart link platform. Automatically redirect users based on their device. Create stunning bio pages in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tap-d.link — Elevate your connections",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tap-d.link — Premium Smart Links & Bio Pages",
    description:
      "The world's most elegant smart link platform. Beautiful bio pages and intelligent device-based redirects.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
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
