"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Login page — /login
   Redesigned for the split-screen layout.
------------------------------------------------------------------ */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.replace("/d/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed. Try again.";
      if (!msg.includes("popup-closed-by-user")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
      className="w-full"
    >
      {/* Heading */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="font-serif text-3xl font-bold text-text-primary mb-3">
          Welcome back
        </h1>
        <p className="text-text-muted">Sign in to manage your smart links and bio page.</p>
      </div>

      {/* Google sign-in */}
      <div className="space-y-4">
        <button
          onClick={handleGoogle}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl",
            "bg-white border-2 border-border text-text-primary font-bold text-base",
            "transition-all duration-200 hover:bg-lavender-light hover:border-lavender hover:-translate-y-0.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender",
            "disabled:opacity-60 disabled:pointer-events-none",
            "shadow-sm"
          )}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon className="w-6 h-6" />
          )}
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-error/5 text-xs text-error font-medium text-center border border-error/10"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted">or</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Form Experience Placeholder */}
      <div className="space-y-4">
        <div className="relative group opacity-50 cursor-not-allowed">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            <span className="text-sm">@</span>
          </div>
          <input 
            disabled
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-border bg-surface-muted text-sm font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-md border border-border text-[0.6rem] font-bold text-text-muted uppercase tracking-tighter shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Soon
          </div>
        </div>

        <p className="text-center text-[0.8rem] text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-text-primary hover:text-accent-pink transition-colors underline underline-offset-4 decoration-border/50"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
