"use client";

import Link from "next/link";

interface BlogPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total: number;
  perPage: number;
}

export function BlogPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  total,
  perPage,
}: BlogPaginationProps) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <nav
      aria-label="Blog pagination"
      className="flex items-center justify-between pt-10 mt-10 border-t border-[rgba(232,184,109,0.2)]"
    >
      {/* Previous */}
      {hasPreviousPage ? (
        <Link
          href={`/blog?page=${currentPage - 1}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(232,184,109,0.4)] text-[13px] font-semibold text-[#1a1625] hover:bg-[rgba(232,184,109,0.1)] transition-colors duration-200"
        >
          ← Previous
        </Link>
      ) : (
        <div />
      )}

      {/* Page info */}
      <span className="text-sm text-[#9b91b5]">
        Page <span className="font-semibold text-[#1a1625]">{currentPage}</span> of{" "}
        <span className="font-semibold text-[#1a1625]">{totalPages}</span>
        <span className="ml-2 text-xs">({total} articles)</span>
      </span>

      {/* Next */}
      {hasNextPage ? (
        <Link
          href={`/blog?page=${currentPage + 1}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a0a0f] text-white text-[13px] font-semibold hover:bg-[#1c1c24] transition-colors duration-200"
        >
          Next →
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
