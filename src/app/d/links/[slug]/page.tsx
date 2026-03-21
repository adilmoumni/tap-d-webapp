"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { LinkForm } from "@/components/dashboard/LinkForm";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { QRCodeSection } from "@/components/dashboard/QRCodeCard";
import { getLinkBySlug, getLinkDailyStats } from "@/lib/db";
import type { SmartLink, DailyStats } from "@/types";

export default function EditLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [link,  setLink]  = useState<SmartLink | null | undefined>(undefined);
  const [stats, setStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    getLinkBySlug(slug).then((l) => setLink(l ?? null));
  }, [slug]);

  useEffect(() => {
    if (link?.id) getLinkDailyStats(link.id, 30).then(setStats);
  }, [link]);

  if (link === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-8 w-48 bg-lavender-light rounded-lg animate-pulse" />
        <div className="h-64 bg-surface border border-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (link === null) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-1">{link.title}</h2>
        <p className="text-sm text-text-muted font-mono">tap-d.link/{link.slug}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Edit form — 3 cols */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text-primary mb-5">Edit Link</h3>
          <LinkForm initial={link} />
        </div>

        {/* Right panel — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Analytics */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-text-primary">Analytics</h3>
              <span className="text-2xl font-bold font-mono text-text-primary">
                {stats.reduce((sum, s) => sum + s.clicks, 0).toLocaleString() || link.clickCount.toLocaleString()}
              </span>
            </div>
            <AnalyticsChart stats={stats} />
          </div>

          {/* QR Code */}
          <QRCodeSection slug={link.slug} title={link.title} />
        </div>
      </div>
    </div>
  );
}
