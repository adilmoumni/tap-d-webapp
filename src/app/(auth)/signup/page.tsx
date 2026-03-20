"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Signup page — /signup
   For MVP: Google sign-in only (same as login but different copy).
   After success: redirect to /dashboard.
------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-up failed. Try again.";
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
    >
      {/* Heading */}
      <div className="text-center mb-2">
        <h1 className="font-serif text-2xl font-medium text-text-primary mb-1.5">
          Claim your page
        </h1>
        <p className="text-sm text-text-muted">Free forever. No credit card needed.</p>
      </div>

      {/* Feature highlights */}
      <div className="my-6 space-y-2">
        {[
          { icon: "🎯", text: "Smart device routing on every link" },
          { icon: "👤", text: "Your bio page at tap-d.link/@you" },
          { icon: "📊", text: "Real-time analytics dashboard" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2.5 text-sm text-text-secondary">
            <span className="w-7 h-7 rounded-lg bg-lavender-light flex items-center justify-center text-sm flex-shrink-0">
              {item.icon}
            </span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Google sign-up */}
      <button
        id="google-signup-btn"
        onClick={handleGoogle}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full",
          "bg-dark text-text-on-dark font-semibold text-sm border border-transparent",
          "transition-all duration-200 hover:bg-dark-elevated hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender",
          "disabled:opacity-60 disabled:pointer-events-none",
          "shadow-md"
        )}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <GoogleIcon />
        )}
        {loading ? "Creating account…" : "Sign up with Google"}
      </button>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-error text-center">
          {error}
        </motion.p>
      )}

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-text-primary underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
