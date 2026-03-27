"use client";

import Link from "next/link";
import { ArrowLeftRight, BarChart3, Eye, PencilLine, Trash2, XCircle } from "lucide-react";

export interface BioPageCardData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isPublic: boolean;
  totalViews: number;
  hasPendingTransfer: boolean;
  pendingTransferToEmail?: string;
}

interface BioPageCardProps {
  page: BioPageCardData;
  onViewStats: (page: BioPageCardData) => void;
  onDelete: (page: BioPageCardData) => void;
  onTransfer: (page: BioPageCardData) => void;
  onCancelTransfer: (page: BioPageCardData) => void;
  canTransfer: boolean;
  onUpgradeTransfer: () => void;
}

function initialsFor(displayName: string, username: string): string {
  const source = displayName.trim() || username.trim();
  if (!source) return "U";
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatViews(value: number): string {
  return `${value.toLocaleString()} views`;
}

function actionClassName(danger = false): string {
  if (danger) {
    return "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#fecaca] text-[#dc2626] transition-colors hover:bg-[#fef2f2]";
  }
  return "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e6e2] text-[#6e6e7e] transition-colors hover:bg-[#f5f3f0] hover:text-[#1a1a2e]";
}

export function BioPageCard({
  page,
  onViewStats,
  onDelete,
  onTransfer,
  onCancelTransfer,
  canTransfer,
  onUpgradeTransfer,
}: BioPageCardProps) {
  const displayName = page.displayName.trim() || page.username;
  const publicUrl = `https://tap-d.link/@${encodeURIComponent(page.username)}`;

  return (
    <article className="group rounded-2xl border border-[#e8e6e2] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {page.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.avatarUrl}
              alt={displayName}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-[#f0eeea] text-[#1a1a2e] font-semibold flex items-center justify-center">
              {initialsFor(displayName, page.username)}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1a1a2e] truncate">@{page.username}</p>
            <p className="text-xs text-[#8a8a9a] truncate">{displayName}</p>
          </div>
        </div>

        <span
          className={
            page.isPublic
              ? "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-[#dcfce7] text-[#166534]"
              : "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-[#f0eeea] text-[#6e6e7e]"
          }
        >
          {page.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[11px] text-[#9a9aa8] truncate" title={page.id}>
          ID: {page.id}
        </p>
        <p className="text-xs text-[#6e6e7e] font-medium">{formatViews(page.totalViews)}</p>
        {page.hasPendingTransfer && (
          <p className="text-xs font-medium text-[#b45309]">
            Pending transfer...
            {page.pendingTransferToEmail ? ` (${page.pendingTransferToEmail})` : ""}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClassName()}
          title="View public bio"
          aria-label={`View @${page.username}`}
        >
          <Eye size={15} />
        </a>

        <Link
          href={`/d/biopages/${encodeURIComponent(page.id)}/edit`}
          className={actionClassName()}
          title="Edit bio page"
          aria-label={`Edit @${page.username}`}
        >
          <PencilLine size={15} />
        </Link>

        <button
          type="button"
          onClick={() => onViewStats(page)}
          className={actionClassName()}
          title="View stats"
          aria-label={`Stats for @${page.username}`}
        >
          <BarChart3 size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(page)}
          className={actionClassName(true)}
          title="Delete bio page"
          aria-label={`Delete @${page.username}`}
        >
          <Trash2 size={15} />
        </button>

        {page.hasPendingTransfer ? (
          <button
            type="button"
            onClick={() => onCancelTransfer(page)}
            className={actionClassName(true)}
            title="Cancel transfer"
            aria-label={`Cancel transfer for @${page.username}`}
          >
            <XCircle size={15} />
          </button>
        ) : canTransfer ? (
          <button
            type="button"
            onClick={() => onTransfer(page)}
            className={actionClassName()}
            title="Transfer bio page"
            aria-label={`Transfer @${page.username}`}
          >
            <ArrowLeftRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpgradeTransfer}
            className={actionClassName()}
            title="Upgrade to Pro to transfer"
            aria-label="Upgrade to Pro to transfer bio pages"
          >
            <ArrowLeftRight size={15} />
          </button>
        )}
      </div>
    </article>
  );
}
