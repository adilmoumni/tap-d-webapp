"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signInWithGoogle, signUpWithEmail } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Smartphone, Target, AreaChart, Dices } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------
   Signup page — /signup
   Redesigned for the split-screen layout.
------------------------------------------------------------------ */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function randomSlug() {
  return `user-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SignupPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [slug, setSlug]       = useState(randomSlug());
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
      const msg = err instanceof Error ? err.message : "Sign-up failed. Try again.";
      if (!msg.includes("popup-closed-by-user")) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name, slug);
      router.replace("/d/dashboard");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (/slug/i.test(String(err?.message || ""))) {
        setError(err.message);
      } else {
        setError("Failed to create account. Please try again.");
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
          Claim your page
        </h1>
        <p className="text-text-muted">Choose your slug and start sharing smarter.</p>
      </div>

      {/* Feature highlights */}
      <div className="mb-10 space-y-4">
        {[
          { icon: Target, text: "Smart device routing on every link", color: "text-accent-pink bg-accent-pink/5" },
          { icon: Smartphone, text: "Beautiful bio page at tap-d.link/your-slug", color: "text-accent-mint bg-accent-mint/5" },
          { icon: AreaChart, text: "Real-time analytics dashboard", color: "text-accent-blue bg-accent-blue/5" },
        ].map((item, idx) => (
          <motion.div 
            key={item.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx + 0.3 }}
            className="flex items-center gap-4 text-sm font-medium text-text-secondary"
          >
            <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:rotate-12", item.color)}>
              <item.icon size={18} />
            </span>
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Email / Password sign-up form */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white text-sm font-medium focus:border-lavender focus:outline-none transition-colors"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white text-sm font-medium focus:border-lavender focus:outline-none transition-colors"
        />
        <div className="flex gap-2">
          <div className="flex-1 flex items-center rounded-2xl border-2 border-border bg-white">
            <span className="pl-4 pr-2 text-sm text-text-muted font-mono">tap-d.link/</span>
            <input
              type="text"
              placeholder="your-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
              required
              minLength={3}
              maxLength={30}
              disabled={loading}
              className="flex-1 py-3 pr-4 rounded-r-2xl bg-white text-sm font-medium focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setSlug(randomSlug())}
            disabled={loading}
            className="px-3 rounded-2xl border-2 border-border bg-white hover:bg-lavender-light transition-colors disabled:opacity-60"
            aria-label="Generate slug"
            title="Generate slug"
          >
            <Dices size={18} />
          </button>
        </div>
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white text-sm font-medium focus:border-lavender focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={loading || !name || !email || !slug || slug.length < 3 || password.length < 6}
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
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-text-muted">or</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Google sign-up */}
      <div className="space-y-4">
        <button
          onClick={handleGoogle}
          disabled={loading}
          type="button"
          className={cn(
            "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl",
            "bg-white border-2 border-border text-text-primary font-bold text-base",
            "transition-all duration-200 hover:bg-lavender-light hover:border-lavender hover:-translate-y-0.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender",
            "disabled:opacity-60 disabled:pointer-events-none",
            "shadow-sm"
          )}
        >
          <GoogleIcon />
          Continue with Google
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

      {/* Login link */}
      <p className="mt-8 text-center text-[0.8rem] text-text-muted">
        Already have an account?{" "}
        <Link 
          href="/login" 
          className="font-bold text-text-primary hover:text-accent-pink transition-colors underline underline-offset-4 decoration-border/50"
        >
          Sign in here
        </Link>
      </p>
    </motion.div>
  );
}
