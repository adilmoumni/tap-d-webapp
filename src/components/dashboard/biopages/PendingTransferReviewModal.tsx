"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PendingBioTransferRecord } from "@/lib/db/bio";

interface PendingTransferReviewModalProps {
  open: boolean;
  transfer: PendingBioTransferRecord | null;
  processing: boolean;
  error: string | null;
  onClose: () => void;
  onAccept: () => void | Promise<void>;
  onDecline: () => void | Promise<void>;
}

function initialsFor(displayName: string, username: string): string {
  const source = displayName.trim() || username.trim();
  if (!source) return "U";

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function PendingTransferReviewModal({
  open,
  transfer,
  processing,
  error,
  onClose,
  onAccept,
  onDecline,
}: PendingTransferReviewModalProps) {
  if (!transfer) {
    return (
      <Modal open={open} onClose={onClose} title="Pending transfer" size="sm">
        <p className="text-sm text-[#8a8a9a]">No transfer selected.</p>
      </Modal>
    );
  }

  const displayName = transfer.displayName.trim() || transfer.username;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!processing) onClose();
      }}
      title={`@${transfer.username} transfer request`}
      description="Review this transfer and choose whether to accept it."
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#1a1a2e] leading-relaxed">
          <span className="font-semibold">{transfer.pendingTransfer.fromEmail}</span>{" "}
          wants to transfer this bio page to you.
        </p>

        <div className="rounded-xl border border-[#e8e6e2] bg-white p-4">
          <div className="flex items-center gap-3">
            {transfer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={transfer.avatarUrl}
                alt={displayName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-[#f0eeea] text-[#1a1a2e] font-semibold flex items-center justify-center">
                {initialsFor(displayName, transfer.username)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1a1a2e] truncate">@{transfer.username}</p>
              <p className="text-xs text-[#8a8a9a] truncate">{displayName}</p>
            </div>
          </div>

          <div className="mt-3 text-xs text-[#6e6e7e]">
            {transfer.linkCount.toLocaleString()} link{transfer.linkCount === 1 ? "" : "s"}
          </div>
        </div>

        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#92400e]">
          Accepting this transfer will move ownership to your account.
        </div>

        {error && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onDecline}
            disabled={processing}
          >
            {processing ? "Working..." : "Decline"}
          </Button>
          <Button type="button" size="sm" onClick={onAccept} disabled={processing}>
            {processing ? "Working..." : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
