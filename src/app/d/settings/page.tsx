"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { changeUsername } from "@/lib/db/bio";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PLANS } from "@/config/plans";

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
    const normalized = usernameDraft.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    
    if (normalized.length < 3) {
      setUsernameError("Must be at least 3 characters.");
      return;
    }
    if (normalized.length > 30) {
      setUsernameError("Must be 30 characters or less.");
      return;
    }
    if (normalized === currentUsername) {
      setEditingUsername(false);
      return;
    }

    if (!profile.activeBioId) {
      setUsernameError("No active bio page found to update.");
      return;
    }

    setSavingUsername(true);
    setUsernameError("");
    try {
      await changeUsername(user.uid, profile.activeBioId, currentUsername, normalized);
      setEditingUsername(false);
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
                tap-d.link/@
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
              tap-d.link/@<span className="font-semibold text-text-primary">{currentUsername}</span>
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

