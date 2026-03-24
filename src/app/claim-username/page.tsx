"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createBioPage } from "@/lib/db/bio";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dices } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";

/* ------------------------------------------------------------------
   Claim Username — shown after first sign-up when profile.username
   is null. User picks a username, we create biopages/{bioId}
   and update their user profile.
------------------------------------------------------------------ */

export default function ClaimUsernamePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // If user already has a username, redirect to dashboard
  useEffect(() => {
    if (profile?.username) {
      router.replace("/d/dashboard");
    }
  }, [profile?.username, router]);

  const normalized = username.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

  const handleRandomize = () => {
    const randomStr = Math.random().toString(36).substring(2, 6);
    setUsername(`user-${randomStr}`);
    setError(null);
  };

  const handleClaim = async () => {
    if (!user || !normalized || normalized.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, _, ., -)");
      return;
    }

    if (normalized.length > 30) {
      setError("Username must be 30 characters or less");
      return;
    }

    setError(null);
    setChecking(true);

    try {
      // Check availability in usernames
      const usernameDoc = await getDoc(doc(db, "usernames", normalized));
      if (usernameDoc.exists()) {
        setError(`@${normalized} is already taken. Try another.`);
        setChecking(false);
        return;
      }

      // Also check if a bio page exists with that slug
      const bioQ = query(collection(db, "biopages"), where("slug", "==", normalized));
      const bioDocs = await getDocs(bioQ);
      if (!bioDocs.empty) {
        setError(`@${normalized} is already taken. Try another.`);
        setChecking(false);
        return;
      }

      setChecking(false);
      setSaving(true);

      // Create bio page + reserve username
      const bioId = await createBioPage(user.uid, normalized, {
        displayName: user.displayName ?? normalized,
        bio: "",
        avatarUrl: user.photoURL ?? null,
      });

      // Update user profile with username & activeBioId
      await updateDoc(doc(db, "users", user.uid), { 
        username: normalized,
        activeBioId: bioId 
      });

      // Navigate to dashboard
      window.location.href = "/d/bio"; // Force reload to re-fetch profile context
    } catch (err) {
      console.error("[ClaimUsername] Error:", err);
      setError("Something went wrong. Please try again.");
      setSaving(false);
      setChecking(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md px-6">
          <h1 className="text-[22px] font-bold text-[#1a1a2e] mb-2">Claim your username</h1>
          <p className="text-[14px] text-[#8a8a9a] mb-8">
            This will be your public bio page URL: tap-d.link/@username
          </p>

          {/* Input */}
          <div className="flex items-center gap-0 mb-3">
            <span className="px-4 py-3 bg-[#f5f3f0] border border-r-0 border-[#e8e6e2] rounded-l-[12px] text-[14px] text-[#8a8a9a] font-mono select-none">
              tap-d.link/@
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""));
                setError(null);
              }}
              placeholder="yourname"
              maxLength={30}
              autoFocus
              className="flex-1 min-w-0 px-4 py-3 border border-[#e8e6e2] text-[14px] text-[#1a1a2e] font-mono focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d] outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && normalized.length >= 3) handleClaim();
              }}
            />
            <button
              onClick={handleRandomize}
              title="Randomize"
              className="px-4 py-3 bg-white border border-l-0 border-[#e8e6e2] rounded-r-[12px] text-[#8a8a9a] hover:bg-[#f5f3f0] hover:text-[#1a1a2e] transition-colors flex items-center justify-center outline-none focus:border-[#e8b86d] focus:ring-1 focus:ring-[#e8b86d]"
            >
              <Dices size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-[#ef4444] mb-4">{error}</p>
          )}

          {/* Claim button */}
          <button
            onClick={handleClaim}
            disabled={normalized.length < 3 || checking || saving}
            className="w-full mt-2 py-3 rounded-[12px] bg-[#0a0a0f] text-white text-[14px] font-semibold hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? "Checking availability..." : saving ? "Creating your page..." : "Claim @" + (normalized || "username")}
          </button>

          <p className="mt-4 text-[11px] text-[#8a8a9a] text-center">
            You can change this later in Settings.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
