import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
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
  title: {
    default: "tap-d.link — Smart Links for Every Device",
    template: "%s | tap-d.link",
  },
  description:
    "Create smart links that automatically redirect iOS, Android, and desktop users to different destinations. Build beautiful bio pages. Track every click.",
  keywords: ["smart links", "deep links", "bio page", "link management", "URL shortener"],
  authors: [{ name: "tap-d.link" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tap-d.link",
    siteName: "tap-d.link",
    title: "tap-d.link — Smart Links for Every Device",
    description:
      "Create smart links that automatically redirect iOS, Android, and desktop users to different destinations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tap-d.link — Smart Links for Every Device",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tap-d.link — Smart Links for Every Device",
    description:
      "Create smart links that automatically redirect iOS, Android, and desktop users to different destinations.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
