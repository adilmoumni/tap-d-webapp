"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  acceptBioPageTransfer,
  cancelBioPageTransfer,
  declineBioPageTransfer,
  deleteBioPageById,
  getBioPageTotalViews,
  getPendingTransfersForRecipient,
  getUserBiopagesPage,
  requestBioPageTransfer,
  setUserActiveBio,
  type PendingBioTransferRecord,
  type UserBiopageRecord,
  type UserBiopagesPageCursor,
} from "@/lib/db/bio";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BioPageCard,
  type BioPageCardData,
} from "@/components/dashboard/biopages/BioPageCard";
import { DeleteBioPageModal } from "@/components/dashboard/biopages/DeleteBioPageModal";
import { CreateBioPageModal } from "@/components/dashboard/biopages/CreateBioPageModal";
import { TransferBioPageModal } from "@/components/dashboard/biopages/TransferBioPageModal";
import { PendingTransferReviewModal } from "@/components/dashboard/biopages/PendingTransferReviewModal";

const BIO_PAGES_PAGE_SIZE = 12;

function transferMeta(page: UserBiopageRecord): {
  hasPendingTransfer: boolean;
  pendingTransferToEmail?: string;
} {
  const pending = page.pendingTransfer;
  if (!pending || pending.status !== "pending") {
    return { hasPendingTransfer: false };
  }

  const toEmail = typeof pending.toEmail === "string" ? pending.toEmail : "";

  return {
    hasPendingTransfer: true,
    pendingTransferToEmail: toEmail || undefined,
  };
}

function toCardData(page: UserBiopageRecord, totalViews: number): BioPageCardData {
  const { hasPendingTransfer, pendingTransferToEmail } = transferMeta(page);

  return {
    id: page.id,
    username: page.username,
    displayName:
      typeof page.displayName === "string" && page.displayName.trim()
        ? page.displayName
        : page.username,
    avatarUrl: typeof page.avatarUrl === "string" ? page.avatarUrl : null,
    isPublic: page.isPublic !== false,
    totalViews,
    hasPendingTransfer,
    pendingTransferToEmail,
  };
}

export default function BioPagesListPage() {
  const { user, profile, loading: authLoading } = useAuth();

  const [pages, setPages] = useState<BioPageCardData[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingBioTransferRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<UserBiopagesPageCursor>(null);
  const [hasMorePages, setHasMorePages] = useState(false);

  const [statsPage, setStatsPage] = useState<BioPageCardData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [deletePage, setDeletePage] = useState<BioPageCardData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalVersion, setCreateModalVersion] = useState(0);

  const [transferPage, setTransferPage] = useState<BioPageCardData | null>(null);
  const [transferModalVersion, setTransferModalVersion] = useState(0);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientTransferId, setRecipientTransferId] = useState<string | null>(null);
  const [recipientProcessing, setRecipientProcessing] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const accountEmail = useMemo(() => {
    const rawEmail = profile?.email ?? user?.email ?? "";
    return rawEmail.trim().toLowerCase();
  }, [profile?.email, user?.email]);

  const fetchDashboardData = useCallback(
    async (showLoading = true, mode: "reset" | "append" = "reset") => {
      if (!user) {
        setPages([]);
        setPendingTransfers([]);
        setError(null);
        setHasMorePages(false);
        setNextCursor(null);
        setLoadingMore(false);
        setLoading(false);
        return;
      }

      if (mode === "append" && !nextCursor) {
        setHasMorePages(false);
        return;
      }

      if (mode === "append") {
        setLoadingMore(true);
      } else if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        const pagePromise = getUserBiopagesPage(user.uid, {
          pageSize: BIO_PAGES_PAGE_SIZE,
          cursor: mode === "append" ? nextCursor : null,
        });
        const pendingTransfersPromise =
          mode === "reset"
            ? accountEmail
              ? getPendingTransfersForRecipient(accountEmail)
              : Promise.resolve<PendingBioTransferRecord[]>([])
            : Promise.resolve<PendingBioTransferRecord[] | null>(null);

        const [pageResult, incomingTransfers] = await Promise.all([
          pagePromise,
          pendingTransfersPromise,
        ]);

        const cards = pageResult.pages.map((page) =>
          toCardData(page, typeof page.totalViews === "number" ? page.totalViews : 0)
        );

        if (mode === "append") {
          setPages((prev) => {
            const seen = new Set(prev.map((item) => item.id));
            const merged = [...prev];
            for (const card of cards) {
              if (!seen.has(card.id)) {
                merged.push(card);
              }
            }
            return merged;
          });
        } else {
          setPages(cards);
        }

        setHasMorePages(pageResult.hasMore);
        setNextCursor(pageResult.nextCursor);

        if (incomingTransfers) {
          setPendingTransfers(incomingTransfers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bio pages");
      } finally {
        if (mode === "append") {
          setLoadingMore(false);
        } else if (showLoading) {
          setLoading(false);
        }
      }
    },
    [accountEmail, nextCursor, user]
  );

  useEffect(() => {
    if (authLoading) return;
    void fetchDashboardData(true, "reset");
  }, [authLoading, fetchDashboardData]);

  const activePendingTransfer = useMemo(() => {
    if (!pendingTransfers.length) return null;

    if (!recipientTransferId) {
      return pendingTransfers[0] ?? null;
    }

    return (
      pendingTransfers.find((transfer) => transfer.bioId === recipientTransferId) ??
      pendingTransfers[0] ??
      null
    );
  }, [pendingTransfers, recipientTransferId]);

  useEffect(() => {
    if (!pendingTransfers.length) {
      setRecipientModalOpen(false);
      setRecipientTransferId(null);
      return;
    }

    if (!recipientTransferId || !pendingTransfers.some((item) => item.bioId === recipientTransferId)) {
      setRecipientTransferId(pendingTransfers[0].bioId);
    }
  }, [pendingTransfers, recipientTransferId]);

  const currentPlan = profile?.plan ?? "free";
  const isFreePlan = currentPlan === "free";
  const isProPlan = currentPlan === "pro";

  const freeLimitReached = isFreePlan && pages.length >= 1;
  const canCreateBioPage = !freeLimitReached;
  const canTransferBioPage = isProPlan;

  const skeletonCards = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);

  const handleConfirmDelete = async () => {
    if (!user || !deletePage) return;

    setDeleting(true);
    setError(null);

    const remaining = pages.filter((page) => page.id !== deletePage.id);

    try {
      await deleteBioPageById(deletePage.id, deletePage.username);

      if (profile?.activeBioId === deletePage.id) {
        const nextActive = remaining[0] ?? null;
        await setUserActiveBio(
          user.uid,
          nextActive?.id ?? null,
          nextActive?.username ?? null
        );
      }

      setPages(remaining);
      setDeletePage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bio page");
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    setCreateModalVersion((value) => value + 1);
    setCreateModalOpen(true);
  };

  const handleUpgradeTransfer = () => {
    setError("Upgrade to Pro to transfer bio pages");
  };

  const handleOpenTransfer = (page: BioPageCardData) => {
    if (!canTransferBioPage) {
      handleUpgradeTransfer();
      return;
    }

    setTransferModalVersion((value) => value + 1);
    setTransferError(null);
    setTransferPage(page);
  };

  const handleSubmitTransfer = async (recipientEmail: string) => {
    if (!user || !transferPage) return;

    const ownerEmail = (profile?.email ?? user.email ?? "").trim();
    if (!ownerEmail) {
      setTransferError("Your account email is missing. Please update it and try again.");
      return;
    }

    setTransferSubmitting(true);
    setTransferError(null);
    setError(null);

    try {
      await requestBioPageTransfer({
        bioId: transferPage.id,
        ownerUid: user.uid,
        ownerEmail,
        recipientEmail,
      });

      setTransferPage(null);
      await fetchDashboardData(false);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      if (rawMessage.includes("Missing or insufficient permissions")) {
        setTransferError("Transfer is blocked by Firestore rules. Make sure your account plan is set to 'pro'.");
        return;
      }
      setTransferError(
        rawMessage
          ? rawMessage
          : "Something went wrong. Please try again."
      );
    } finally {
      setTransferSubmitting(false);
    }
  };

  const handleCancelTransfer = async (page: BioPageCardData) => {
    if (!user) return;

    setError(null);

    try {
      await cancelBioPageTransfer({
        bioId: page.id,
        ownerUid: user.uid,
      });
      await fetchDashboardData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel transfer.");
    }
  };

  const openRecipientReviewModal = (bioId?: string) => {
    setRecipientError(null);
    if (bioId) {
      setRecipientTransferId(bioId);
    } else if (pendingTransfers.length > 0) {
      setRecipientTransferId(pendingTransfers[0].bioId);
    }
    setRecipientModalOpen(true);
  };

  const handleAcceptTransfer = async () => {
    if (!user || !accountEmail || !activePendingTransfer) return;

    setRecipientProcessing(true);
    setRecipientError(null);
    setError(null);

    const targetTransfer = activePendingTransfer;

    try {
      await acceptBioPageTransfer({
        bioId: targetTransfer.bioId,
        recipientUid: user.uid,
        recipientEmail: accountEmail,
      });

      const remaining = pendingTransfers.filter((item) => item.bioId !== targetTransfer.bioId);
      setPendingTransfers(remaining);

      if (!remaining.length) {
        setRecipientModalOpen(false);
        setRecipientTransferId(null);
      } else {
        setRecipientTransferId(remaining[0].bioId);
      }

      await fetchDashboardData(false);
    } catch (err) {
      setRecipientError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setRecipientProcessing(false);
    }
  };

  const handleDeclineTransfer = async () => {
    if (!accountEmail || !activePendingTransfer) return;

    setRecipientProcessing(true);
    setRecipientError(null);
    setError(null);

    const targetTransfer = activePendingTransfer;

    try {
      await declineBioPageTransfer({
        bioId: targetTransfer.bioId,
        recipientEmail: accountEmail,
      });

      const remaining = pendingTransfers.filter((item) => item.bioId !== targetTransfer.bioId);
      setPendingTransfers(remaining);

      if (!remaining.length) {
        setRecipientModalOpen(false);
        setRecipientTransferId(null);
      } else {
        setRecipientTransferId(remaining[0].bioId);
      }

      await fetchDashboardData(false);
    } catch (err) {
      setRecipientError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setRecipientProcessing(false);
    }
  };

  const handleViewStats = async (page: BioPageCardData) => {
    setStatsPage(page);
    setStatsLoading(true);

    try {
      const totalViews = await getBioPageTotalViews(page.id, page.totalViews);

      setStatsPage((current) =>
        current && current.id === page.id
          ? { ...current, totalViews }
          : current
      );
      setPages((current) =>
        current.map((item) =>
          item.id === page.id ? { ...item, totalViews } : item
        )
      );
    } catch {
      // Keep the card fallback value when stats read fails.
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLoadMorePages = async () => {
    if (loadingMore || !hasMorePages) return;
    await fetchDashboardData(false, "append");
  };

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[#1a1a2e]">My Bio Pages</h1>
        <p className="text-sm text-[#8a8a9a] mt-1">Manage all your bio pages in one place</p>
      </div>

      {canCreateBioPage && (
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl"
          onClick={openCreateModal}
        >
          <Plus size={15} />
          Create New
        </Button>
      )}
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="p-5 lg:p-6 space-y-5">
        {header}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skeletonCards.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-[#e8e6e2] bg-white p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton circle width="w-12" height="h-12" />
                  <div className="space-y-2">
                    <Skeleton width="w-24" height="h-3.5" />
                    <Skeleton width="w-32" height="h-3" />
                  </div>
                </div>
                <Skeleton width="w-14" height="h-6" className="rounded-full" />
              </div>
              <Skeleton width="w-20" height="h-3" />
              <div className="flex gap-2">
                <Skeleton width="w-8" height="h-8" className="rounded-lg" />
                <Skeleton width="w-8" height="h-8" className="rounded-lg" />
                <Skeleton width="w-8" height="h-8" className="rounded-lg" />
                <Skeleton width="w-8" height="h-8" className="rounded-lg" />
                <Skeleton width="w-8" height="h-8" className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        {header}
        <p className="text-sm text-[#8a8a9a] mt-6">Sign in required.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 lg:p-6 space-y-5">
        {header}

        {error && (
          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            {error}
          </div>
        )}

        {!canTransferBioPage && (
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#334155]">
              Upgrade to Pro to transfer bio pages.
            </p>
            <Button asChild variant="secondary" size="sm" className="rounded-xl">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}

        {pendingTransfers.length > 0 && (
          <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#1e40af]">
              You have {pendingTransfers.length} pending bio page transfer{pendingTransfers.length > 1 ? "s" : ""}.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => openRecipientReviewModal()}
            >
              Review Transfer{pendingTransfers.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {freeLimitReached && (
          <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#92400e]">
              You&apos;ve reached the Free plan limit (1 bio page). Upgrade to Pro for unlimited bio pages.
            </p>
            <Button asChild variant="secondary" size="sm" className="rounded-xl">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d7d3cc] bg-white p-10 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#f0eeea] flex items-center justify-center text-[#6e6e7e]">
              <UserRound size={22} />
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">No bio pages yet</h2>
            <p className="text-sm text-[#8a8a9a] mt-2 max-w-md mx-auto">
              Create your first bio page to share all your links in one place.
            </p>
            <div className="mt-5">
              {canCreateBioPage ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl"
                  onClick={openCreateModal}
                >
                  Create Bio Page
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm" className="rounded-xl">
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <BioPageCard
                key={page.id}
                page={page}
                onViewStats={handleViewStats}
                onDelete={setDeletePage}
                onTransfer={handleOpenTransfer}
                onCancelTransfer={handleCancelTransfer}
                canTransfer={canTransferBioPage}
                onUpgradeTransfer={handleUpgradeTransfer}
              />
            ))}

            {canCreateBioPage && (
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-2xl border-2 border-dashed border-[#d7d3cc] bg-white p-6 text-left transition-colors hover:border-[#b8b2a7]"
              >
                <div className="h-10 w-10 rounded-full bg-[#f0eeea] text-[#1a1a2e] flex items-center justify-center mb-4">
                  <Plus size={18} />
                </div>
                <p className="text-sm font-semibold text-[#1a1a2e]">+ Create New Bio Page</p>
                <p className="text-xs text-[#8a8a9a] mt-1">Add another bio page for a different campaign or audience.</p>
              </button>
            )}
          </div>
        )}

        {pages.length > 0 && hasMorePages && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              disabled={loadingMore}
              onClick={() => void handleLoadMorePages()}
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading more
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(statsPage)}
        onClose={() => setStatsPage(null)}
        title={statsPage ? `@${statsPage.username} stats` : "Bio stats"}
        description="Current aggregate for this bio page"
        size="sm"
      >
        <div className="space-y-2">
          <p className="text-sm text-[#8a8a9a]">Total visitors recorded</p>
          <p className="text-3xl font-semibold text-[#1a1a2e]">
            {statsLoading
              ? "Loading..."
              : statsPage
                ? statsPage.totalViews.toLocaleString()
                : "0"}
          </p>
        </div>
      </Modal>

      <CreateBioPageModal
        key={`create-${createModalVersion}`}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        uid={user.uid}
        plan={profile?.plan ?? "free"}
        existingBioCount={pages.length}
        defaultDisplayName={profile?.displayName ?? user.displayName ?? ""}
      />

      <DeleteBioPageModal
        open={Boolean(deletePage)}
        page={deletePage}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeletePage(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <TransferBioPageModal
        key={`transfer-${transferModalVersion}`}
        open={Boolean(transferPage)}
        page={transferPage}
        submitting={transferSubmitting}
        error={transferError}
        onClose={() => {
          if (transferSubmitting) return;
          setTransferPage(null);
          setTransferError(null);
        }}
        onSubmit={handleSubmitTransfer}
      />

      <PendingTransferReviewModal
        open={recipientModalOpen && Boolean(activePendingTransfer)}
        transfer={activePendingTransfer}
        processing={recipientProcessing}
        error={recipientError}
        onClose={() => {
          if (!recipientProcessing) {
            setRecipientModalOpen(false);
          }
        }}
        onAccept={handleAcceptTransfer}
        onDecline={handleDeclineTransfer}
      />
    </>
  );
}
