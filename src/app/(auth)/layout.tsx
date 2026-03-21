import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { AuthSidebar } from "@/components/auth/AuthSidebar";

/* ------------------------------------------------------------------
   Auth layout — Two-column split layout for /login and /signup.
   - Left: AuthSidebar (Marketing visuals, hidden on mobile)
   - Right: Active Auth Form (Centered in viewport)
------------------------------------------------------------------ */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* 1. Marketing Sidebar (Left) */}
      <AuthSidebar />

      {/* 2. Main Auth Content (Right) */}
      <div className="flex-1 relative flex flex-col items-center">
        {/* Persistent Header */}
        <header className="w-full flex items-center justify-between px-6 md:px-12 py-8 relative z-20">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" theme="dark" />
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </header>

        {/* Center Auth Card */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-6 pb-12">
          <div className="w-full">
            {children}
          </div>

          {/* Minimal Auth Footer */}
          <p className="mt-12 text-xs text-text-muted text-center max-w-[280px]">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-text-primary font-medium hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-text-primary font-medium hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        {/* Decorative Background for form side (Subtle) */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-lavender/5 blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
}
