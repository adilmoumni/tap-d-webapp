import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

/* ------------------------------------------------------------------
   Auth layout — full-screen lavender, centered card, no nav/footer.
   Shared by /login and /signup.
------------------------------------------------------------------ */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Logo back to home */}
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <Logo size="md" theme="light" />
      </Link>

      {/* Centered card */}
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-border shadow-card p-8">
        {children}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-text-muted text-center">
        By continuing, you agree to our{" "}
        <Link href="#" className="underline hover:text-text-primary transition-colors">Terms</Link>
        {" "}and{" "}
        <Link href="#" className="underline hover:text-text-primary transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
