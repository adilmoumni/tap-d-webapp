"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { BioPageCardData } from "@/components/dashboard/biopages/BioPageCard";

interface TransferBioPageModalProps {
  open: boolean;
  page: BioPageCardData | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (recipientEmail: string) => void | Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TransferBioPageModal({
  open,
  page,
  submitting,
  error,
  onClose,
  onSubmit,
}: TransferBioPageModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const normalizedEmail = recipientEmail.trim().toLowerCase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setLocalError("Enter a valid email address.");
      return;
    }

    setLocalError(null);
    await onSubmit(normalizedEmail);
  };

  const handleClose = () => {
    if (submitting) return;
    setLocalError(null);
    onClose();
  };

  const errorMessage = localError ?? error;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={page ? `Transfer @${page.username}` : "Transfer bio page"}
      description="Send this bio page to another account by email."
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#92400e]">
          ⚠️ You will lose access to this bio page. This cannot be undone.
        </div>

        <div>
          <label htmlFor="transfer-recipient-email" className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
            Recipient email address
          </label>
          <input
            id="transfer-recipient-email"
            type="email"
            value={recipientEmail}
            onChange={(event) => {
              setRecipientEmail(event.target.value);
              setLocalError(null);
            }}
            placeholder="name@example.com"
            className="w-full rounded-xl border border-[#e8e6e2] px-3 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#cfcbbf]"
            autoComplete="email"
            required
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting || !normalizedEmail}>
            {submitting ? "Sending..." : "Send Transfer Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
