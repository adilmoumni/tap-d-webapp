import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Leaving tap-d.link" },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function OutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
