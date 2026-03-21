"use client";

import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PLANS } from "@/config/plans";

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const currentPlan = PLANS.find((p) => p.id === (profile?.plan ?? "free"));

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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
