"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { useLinks } from "@/hooks/useLinks";

/* ------------------------------------------------------------------
   My Links page — /d/links
   Search + filter · flat link rows matching the mockup
------------------------------------------------------------------ */

export default function LinksPage() {
  const { links, loading, remove } = useLinks();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "smart" | "regular">("all");

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    await remove(id);
  };

  const filtered = links.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "smart"   && l.isSmart) ||
      (filter === "regular" && !l.isSmart);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-5">
      {/* Search + filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search links…"
          className="flex-1 px-3 py-[8px] border border-border rounded-lg text-[12px] bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lavender"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-[10px] py-[8px] border border-border rounded-lg text-[12px] bg-surface text-text-primary focus:outline-none focus:border-lavender"
        >
          <option value="all">All links</option>
          <option value="smart">Smart only</option>
          <option value="regular">Regular</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[60px] bg-lavender-light rounded-xl animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-lavender-light flex items-center justify-center mx-auto mb-3">
            <Link2 size={20} className="text-lavender-dark" />
          </div>
          <p className="text-[13px] font-medium text-text-primary mb-1">No links yet</p>
          <p className="text-[12px] text-text-muted mb-4">
            Create your first smart link to route visitors automatically.
          </p>
          <Link
            href="/d/links/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dark text-[#f0eef5] text-xs font-medium hover:bg-dark-card transition-colors"
          >
            <span className="w-[5px] h-[5px] rounded-full bg-accent-pink" />
            Create smart link
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] text-text-muted text-center py-10">
          No links match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((link, i) => (
            <LinkCard key={link.id} link={link} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
