"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBioEditor } from "@/contexts/BioEditorContext";
import { cancelBioPageTransfer, changeUsername, requestBioPageTransfer } from "@/lib/db/bio";
import { isValidPublicSlug, normalizePublicSlug } from "@/lib/slug";
import { Button } from "@/components/ui/Button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BioSettingsTab() {
  const { user, profile } = useAuth();
  const { data, activeBioId, updateField, updateTheme } = useBioEditor();

  const bioId = activeBioId;
  const currentSlug = data.slug ?? "";
  const isProPlan = profile?.plan === "pro";
  const pendingTransferFromDoc =
    data.pendingTransfer && data.pendingTransfer.status === "pending"
      ? data.pendingTransfer
      : null;
  const initialPendingEmail = pendingTransferFromDoc?.toEmail?.trim().toLowerCase() ?? "";

  const [slugDraft, setSlugDraft] = useState(currentSlug);
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [slugSuccess, setSlugSuccess] = useState("");

  const [transferEmail, setTransferEmail] = useState("");
  const [pendingTransferEmail, setPendingTransferEmail] = useState(initialPendingEmail);
  const [transferSaving, setTransferSaving] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  useEffect(() => {
    setSlugDraft(currentSlug);
  }, [currentSlug]);

  useEffect(() => {
    setPendingTransferEmail(initialPendingEmail);
  }, [initialPendingEmail]);

  const handleSaveSlug = async () => {
    if (!user || !bioId) {
      setSlugError("Missing user or bio page context.");
      return;
    }

    const normalized = normalizePublicSlug(slugDraft);

    if (!isValidPublicSlug(normalized)) {
      setSlugError("Slug must be 3-30 chars and use lowercase letters, numbers, dot, dash, or underscore.");
      setSlugSuccess("");
      return;
    }

    if (!currentSlug) {
      setSlugError("Current slug is missing for this bio page.");
      setSlugSuccess("");
      return;
    }

    if (normalized === currentSlug) {
      setSlugSuccess("No changes to save.");
      setSlugError("");
      return;
    }

    setSlugSaving(true);
    setSlugError("");
    setSlugSuccess("");

    try {
      await changeUsername(user.uid, bioId, currentSlug, normalized);
      setSlugSuccess("Bio link updated.");
      // Keep local contexts in sync (useAuth/profile is not realtime yet).
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update bio slug.";
      setSlugError(message);
      setSlugSuccess("");
    } finally {
      setSlugSaving(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (!user || !bioId) {
      setTransferError("Missing user or bio page context.");
      return;
    }

    if (!isProPlan) {
      setTransferError("Upgrade to Pro to transfer bio pages.");
      setTransferSuccess("");
      return;
    }

    if (pendingTransferEmail) {
      setTransferError("This bio page already has a pending transfer.");
      setTransferSuccess("");
      return;
    }

    const normalizedRecipient = transferEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedRecipient)) {
      setTransferError("Enter a valid email address.");
      setTransferSuccess("");
      return;
    }

    const ownerEmail = (profile?.email ?? user.email ?? "").trim();
    if (!ownerEmail) {
      setTransferError("Your account email is missing. Please update it and try again.");
      setTransferSuccess("");
      return;
    }

    setTransferSaving(true);
    setTransferError("");
    setTransferSuccess("");

    try {
      await requestBioPageTransfer({
        bioId,
        ownerUid: user.uid,
        ownerEmail,
        recipientEmail: normalizedRecipient,
      });

      setPendingTransferEmail(normalizedRecipient);
      setTransferSuccess("Transfer request sent.");
      setTransferEmail("");
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      const message = rawMessage.includes("Missing or insufficient permissions")
        ? "Transfer is blocked by Firestore rules. Make sure your account plan is set to 'pro'."
        : (rawMessage || "Failed to send transfer request.");
      setTransferError(message);
      setTransferSuccess("");
    } finally {
      setTransferSaving(false);
    }
  };

  const handleCancelTransfer = async () => {
    if (!user || !bioId || !pendingTransferEmail) return;

    setTransferSaving(true);
    setTransferError("");
    setTransferSuccess("");

    try {
      await cancelBioPageTransfer({
        bioId,
        ownerUid: user.uid,
      });
      setPendingTransferEmail("");
      setTransferSuccess("Pending transfer cancelled.");
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      const message = rawMessage.includes("Missing or insufficient permissions")
        ? "Cancel is blocked by Firestore rules for this account."
        : (rawMessage || "Failed to cancel transfer.");
      setTransferError(message);
      setTransferSuccess("");
    } finally {
      setTransferSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-2">Bio Settings</h2>
      <p className="text-sm text-[#8a8a9a] mb-5">
        Update the public slug for this bio page.
      </p>

      <div className="rounded-2xl border border-[#e8e6e2] bg-white p-5 space-y-4 mb-5">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">Visibility</h3>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1a1a2e]">Public bio page</p>
            <p className="text-xs text-[#8a8a9a]">Allow visitors to open this page via your link.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.isPublic}
            onClick={() => updateField("isPublic", !data.isPublic)}
            className={`relative w-10 h-6 rounded-full transition-colors ${data.isPublic ? "bg-[#22c55e]" : "bg-[#e8e6e2]"}`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
              style={{ left: data.isPublic ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1a1a2e]">Show @username</p>
            <p className="text-xs text-[#8a8a9a]">Display the username line under your display name.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.theme.showUsername !== false}
            onClick={() => updateTheme("showUsername", !(data.theme.showUsername !== false))}
            className={`relative w-10 h-6 rounded-full transition-colors ${(data.theme.showUsername !== false) ? "bg-[#22c55e]" : "bg-[#e8e6e2]"}`}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
              style={{ left: (data.theme.showUsername !== false) ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e6e2] bg-white p-5 space-y-3">
        <label className="block text-sm font-medium text-[#1a1a2e]">Public bio link</label>

        <div className="flex items-center gap-0">
          <span className="px-3 py-2 bg-[#f8f7f5] border border-r-0 border-[#e8e6e2] rounded-l-lg text-sm text-[#6e6e7e] font-mono">
            tap-d.link/
          </span>
          <input
            type="text"
            value={slugDraft}
            onChange={(event) => {
              setSlugDraft(event.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""));
              setSlugError("");
              setSlugSuccess("");
            }}
            disabled={slugSaving}
            placeholder="yourname"
            className="flex-1 px-3 py-2 bg-[#f8f7f5] border border-[#e8e6e2] rounded-r-lg text-sm text-[#1a1a2e] focus:border-[#cfcbbf] focus:ring-1 focus:ring-[#cfcbbf] outline-none transition-all font-mono"
          />
        </div>
        <p className="text-xs text-[#8a8a9a]">
          Use 3-30 chars: lowercase letters, numbers, dots, dashes, and underscores.
        </p>

        {slugError && <p className="text-xs text-red-600 font-medium">{slugError}</p>}
        {slugSuccess && <p className="text-xs text-emerald-600 font-medium">{slugSuccess}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSlugDraft(currentSlug);
              setSlugError("");
              setSlugSuccess("");
            }}
            disabled={slugSaving}
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSlug}
            disabled={slugSaving || !slugDraft || normalizePublicSlug(slugDraft) === currentSlug}
          >
            {slugSaving ? "Saving..." : "Save Slug"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e8e6e2] bg-white p-5 space-y-3 mt-5">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">Transfer ownership</h3>
        <p className="text-xs text-[#8a8a9a]">
          Send this bio page to another account by email. You will lose access after it is accepted.
        </p>

        {!isProPlan && (
          <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#92400e]">
            Upgrade to Pro to transfer bio pages.
          </div>
        )}

        {pendingTransferEmail ? (
          <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-2 text-sm text-[#1e3a8a]">
            Pending transfer to <span className="font-medium">{pendingTransferEmail}</span>.
          </div>
        ) : (
          <div>
            <label htmlFor="settings-transfer-email" className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
              Recipient email address
            </label>
            <input
              id="settings-transfer-email"
              type="email"
              value={transferEmail}
              onChange={(event) => {
                setTransferEmail(event.target.value);
                setTransferError("");
                setTransferSuccess("");
              }}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[#e8e6e2] px-3 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#cfcbbf]"
              autoComplete="email"
              disabled={transferSaving || !isProPlan}
            />
          </div>
        )}

        {transferError && <p className="text-xs text-red-600 font-medium">{transferError}</p>}
        {transferSuccess && <p className="text-xs text-emerald-600 font-medium">{transferSuccess}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          {pendingTransferEmail ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelTransfer}
              disabled={transferSaving}
            >
              {transferSaving ? "Cancelling..." : "Cancel Transfer"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleRequestTransfer}
              disabled={transferSaving || !isProPlan || !transferEmail.trim()}
            >
              {transferSaving ? "Sending..." : "Send Transfer Request"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
