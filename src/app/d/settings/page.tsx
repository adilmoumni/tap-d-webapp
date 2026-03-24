"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { createBioPage } from "@/lib/db/bio";
import { changeUsername } from "@/lib/db/bio";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PLANS } from "@/config/plans";
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { isValidPublicSlug, normalizePublicSlug } from "@/lib/slug";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === (profile?.plan ?? "free"));
  const currentUsername = profile?.username ?? "";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const handleEditUsername = () => {
    setUsernameDraft(currentUsername);
    setEditingUsername(true);
    setUsernameError("");
  };

  const handleSaveUsername = async () => {
    if (!user || !profile) return;
    const normalized = normalizePublicSlug(usernameDraft);
    
    if (!isValidPublicSlug(normalized)) {
      setUsernameError("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
      return;
    }
    if (normalized === currentUsername) {
      setEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    setUsernameError("");
    try {
      let activeBioId = profile.activeBioId ?? null;

      // Legacy safety: recover activeBioId when missing.
      if (!activeBioId && currentUsername) {
        const q = query(collection(db, "biopages"), where("slug", "==", currentUsername), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          activeBioId = snap.docs[0].id;
          await updateDoc(doc(db, "users", user.uid), {
            activeBioId,
            updatedAt: serverTimestamp(),
          });
        } else {
          const usernameSnap = await getDoc(doc(db, "usernames", currentUsername));
          const linkedBioId = usernameSnap.exists() ? (usernameSnap.data()?.bioId as string | undefined) : undefined;
          if (linkedBioId) {
            activeBioId = linkedBioId;
            await updateDoc(doc(db, "users", user.uid), {
              activeBioId,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      if (!activeBioId) {
        // Self-heal: create a new active bio page using the requested slug.
        activeBioId = await createBioPage(user.uid, normalized, {
          displayName: profile.displayName ?? user.displayName ?? normalized,
          avatarUrl: profile.photoURL ?? user.photoURL ?? null,
          bio: "",
        });

        await updateDoc(doc(db, "users", user.uid), {
          username: normalized,
          activeBioId,
          updatedAt: serverTimestamp(),
        });

        setEditingUsername(false);
        window.location.reload();
        return;
      }

      await changeUsername(user.uid, activeBioId, currentUsername, normalized);
      setEditingUsername(false);
      // `useAuth` profile is not realtime yet; force refresh so UI shows new slug immediately.
      window.location.reload();
    } catch (err: any) {
      setUsernameError(err.message || "Failed to update username");
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Account Section */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-text-primary mb-4">Account</h3>
        <div className="flex items-center gap-4 mb-5">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? "User"} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-lavender flex items-center justify-center">
              <span className="text-xl font-semibold text-text-primary">
                {user?.displayName?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{user?.displayName}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 py-3 border-t border-border">
          <span className="text-sm text-text-secondary">Plan</span>
          <Badge variant={profile?.plan ?? "free"}>{currentPlan?.name ?? "Free"}</Badge>
          {profile?.plan === "free" && (
            <a href="/pricing" className="ml-auto text-xs font-semibold text-lavender-dark hover:underline">
              Upgrade →
            </a>
          )}
        </div>
      </div>

      {/* Bio Link Section */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Bio Link</h3>
          {!editingUsername && (
            <Button variant="secondary" size="sm" onClick={handleEditUsername}>Customize link</Button>
          )}
        </div>
        
        {editingUsername ? (
          <div className="space-y-3">
            <div className="flex items-center gap-0">
              <span className="px-3 py-2 bg-background border border-r-0 border-border rounded-l-lg text-sm text-text-secondary font-mono">
                tap-d.link/
              </span>
              <input 
                type="text"
                value={usernameDraft}
                onChange={e => {
                  setUsernameDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""));
                  setUsernameError("");
                }}
                disabled={savingUsername}
                placeholder="yourname"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-r-lg text-sm text-text-primary focus:border-lavender-dark focus:ring-1 focus:ring-lavender-dark outline-none transition-all font-mono"
              />
            </div>
            {usernameError && <p className="text-xs text-red-500 font-medium">{usernameError}</p>}
            <div className="flex items-center gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingUsername(false)} disabled={savingUsername}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveUsername} disabled={savingUsername}>
                {savingUsername ? "Saving..." : "Save Link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border overflow-hidden">
            <span className="text-text-secondary font-mono text-sm max-w-full truncate">
              tap-d.link/<span className="font-semibold text-text-primary">{currentUsername}</span>
            </span>
          </div>
        )}
      </div>

      {currentPlan && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text-primary mb-4">Plan Limits</h3>
          <div className="space-y-3">
            {[
              { label: "Links",     value: currentPlan.limits.links },
              { label: "Clicks/mo", value: currentPlan.limits.clicks },
              { label: "Bio pages", value: currentPlan.limits.bioPages },
              { label: "Analytics", value: `${currentPlan.limits.analyticsRetentionDays}d` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className="font-mono font-semibold text-text-primary">
                  {value === "unlimited" ? "∞" : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-text-primary mb-4">Session</h3>
        <Button variant="danger" size="sm" onClick={handleSignOut}>Sign out</Button>
      </div>
    </div>
  );
}
