"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/config/plans";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  createAdditionalBioPage,
  getUserBiopages,
  isBioUsernameAvailable,
  isValidBioUsername,
  normalizeBioUsername,
  setUserActiveBio,
} from "@/lib/db/bio";

type AvailabilityState = "idle" | "invalid" | "checking" | "available" | "taken";

interface CreateBioPageModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  plan: PlanId;
  existingBioCount: number;
  defaultDisplayName?: string | null;
}

export function CreateBioPageModal({
  open,
  onClose,
  uid,
  plan,
  existingBioCount,
  defaultDisplayName,
}: CreateBioPageModalProps) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState((defaultDisplayName ?? "").slice(0, 50));
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedUsernameRef = useRef("");

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const usernameValid = isValidBioUsername(username);
  const displayNameValid = displayName.trim().length > 0 && displayName.trim().length <= 50;
  const canSubmit = usernameValid && availability === "available" && displayNameValid && !submitting;

  const handleUsernameChange = (value: string) => {
    const normalized = normalizeBioUsername(value);
    setUsername(normalized);
    setFormError(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!normalized) {
      setAvailability("idle");
      return;
    }

    if (!isValidBioUsername(normalized)) {
      setAvailability("invalid");
      return;
    }

    setAvailability("checking");
    lastCheckedUsernameRef.current = normalized;

    timerRef.current = setTimeout(async () => {
      try {
        const available = await isBioUsernameAvailable(normalized);
        if (lastCheckedUsernameRef.current !== normalized) return;
        setAvailability(available ? "available" : "taken");
      } catch {
        if (lastCheckedUsernameRef.current !== normalized) return;
        setAvailability("idle");
        setFormError("Something went wrong. Please try again.");
      }
    }, 350);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedUsername = normalizeBioUsername(username);
    const trimmedDisplayName = displayName.trim();
    const trimmedBio = bio.trim();

    if (!isValidBioUsername(normalizedUsername)) {
      setAvailability("invalid");
      return;
    }

    if (!trimmedDisplayName) {
      setFormError("Display name is required.");
      return;
    }

    if (plan === "free" && existingBioCount >= 1) {
      setFormError("Upgrade to Pro for more bio pages");
      return;
    }

    setSubmitting(true);

    try {
      const userBios = await getUserBiopages(uid);
      if (plan === "free" && userBios.length >= 1) {
        setFormError("Upgrade to Pro for more bio pages");
        setSubmitting(false);
        return;
      }

      const available = await isBioUsernameAvailable(normalizedUsername);
      if (!available) {
        setAvailability("taken");
        setFormError("This username is already taken. Try another.");
        setSubmitting(false);
        return;
      }

      const createdUsername = await createAdditionalBioPage({
        uid,
        username: normalizedUsername,
        displayName: trimmedDisplayName,
        bio: trimmedBio,
      });

      await setUserActiveBio(uid, createdUsername, createdUsername);
      onClose();
      router.push(`/d/biopages/${encodeURIComponent(createdUsername)}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("taken")) {
        setAvailability("taken");
        setFormError("This username is already taken. Try another.");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const availabilityText =
    availability === "available"
      ? "✓ Available"
      : availability === "taken"
      ? "✗ Taken"
      : availability === "checking"
      ? "Checking availability..."
      : availability === "invalid"
      ? "Use 3-30 lowercase letters, numbers, or underscores"
      : "";

  const availabilityClassName =
    availability === "available"
      ? "text-emerald-600"
      : availability === "taken" || availability === "invalid"
      ? "text-red-600"
      : "text-[#8a8a9a]";

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title="Create Bio Page"
      description="Set up a new bio page and start customizing it."
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new-bio-username" className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
            Username
          </label>
          <div className="flex items-center rounded-xl border border-[#e8e6e2] overflow-hidden bg-white">
            <span className="px-3 py-2.5 text-sm text-[#8a8a9a] bg-[#f8f7f5] border-r border-[#e8e6e2] whitespace-nowrap">
              tap-d.link/@
            </span>
            <input
              id="new-bio-username"
              type="text"
              value={username}
              onChange={(event) => handleUsernameChange(event.target.value)}
              placeholder="yourname"
              className="flex-1 px-3 py-2.5 text-sm text-[#1a1a2e] focus:outline-none"
              autoComplete="off"
              maxLength={30}
              required
            />
          </div>
          <p className={`mt-1 text-xs min-h-[16px] ${availabilityClassName}`}>{availabilityText}</p>
        </div>

        <div>
          <label htmlFor="new-bio-display-name" className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
            Display Name
          </label>
          <input
            id="new-bio-display-name"
            type="text"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value.slice(0, 50));
              setFormError(null);
            }}
            placeholder="Your Name"
            className="w-full rounded-xl border border-[#e8e6e2] px-3 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#cfcbbf]"
            maxLength={50}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="new-bio-bio" className="block text-sm font-medium text-[#1a1a2e]">
              Bio
            </label>
            <span className="text-xs text-[#8a8a9a]">{bio.length}/160</span>
          </div>
          <textarea
            id="new-bio-bio"
            value={bio}
            onChange={(event) => {
              setBio(event.target.value.slice(0, 160));
              setFormError(null);
            }}
            placeholder="Creator, developer, dreamer"
            className="w-full rounded-xl border border-[#e8e6e2] px-3 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#cfcbbf] min-h-[96px] resize-none"
            maxLength={160}
          />
        </div>

        {formError && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {submitting ? "Creating..." : "Create Bio Page"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
