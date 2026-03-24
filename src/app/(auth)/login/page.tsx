"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/d/dashboard");
    }
  }, [user, authLoading, router]);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.replace("/d/dashboard");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
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
        <p className="text-[11px] text-text-muted mt-2">Only sign in on tap-d.link.</p>
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

      {/* Email / Password sign-in form */}
      <div className="space-y-4">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white text-sm font-medium focus:border-lavender focus:outline-none transition-colors"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white text-sm font-medium focus:border-lavender focus:outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl",
              "bg-dark text-text-on-dark font-bold text-base border-2 border-transparent",
              "transition-all duration-200 hover:bg-dark-elevated hover:-translate-y-0.5",
              "focus-visible:outline-none focus-visible:ring-2 ring-lavender",
              "disabled:opacity-60 disabled:pointer-events-none shadow-xl shadow-dark/10 mt-2"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

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
