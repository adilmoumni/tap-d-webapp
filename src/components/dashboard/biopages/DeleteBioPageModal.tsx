"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { BioPageCardData } from "@/components/dashboard/biopages/BioPageCard";

interface DeleteBioPageModalProps {
  open: boolean;
  page: BioPageCardData | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBioPageModal({
  open,
  page,
  deleting,
  onClose,
  onConfirm,
}: DeleteBioPageModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete bio page?"
      description="This action is permanent. Links and analytics for this bio page will no longer be available."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
          {page ? `You are deleting @${page.username}.` : "You are deleting this bio page."}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
