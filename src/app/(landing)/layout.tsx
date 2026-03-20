import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

/* ------------------------------------------------------------------
   Landing layout — wraps all (landing) routes.
   Renders Navbar (fixed) above and Footer below children.
   NOT used in (dashboard) or (auth) route groups.
------------------------------------------------------------------ */

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
