import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | tap-d.link" },
  description: "Privacy Policy for tap-d.link.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="pt-28 pb-16 px-6">
      <article className="mx-auto max-w-[860px] rounded-[18px] border border-[#e8e6e2] bg-white p-6 sm:p-10">
        <h1 className="text-3xl font-semibold text-[#1a1a2e] mb-3">Privacy Policy</h1>
        <p className="text-sm text-[#7a7a8e] mb-8">Last updated: March 24, 2026</p>

        <div className="space-y-5 text-[15px] leading-7 text-[#333547]">
          <p>
            tap-d.link collects the minimum data needed to provide short links, bio pages, and analytics.
            We do not sell personal information.
          </p>
          <p>
            We process account details (such as email), content you publish, and aggregate usage signals
            (such as clicks, device type, and country) to operate and improve the service.
          </p>
          <p>
            You are responsible for the destinations you publish. Harmful, deceptive, or phishing content
            is prohibited and may be removed.
          </p>
          <p>
            If you need account or data support, contact: <a className="underline" href="mailto:hello@tap-d.link">hello@tap-d.link</a>.
          </p>
        </div>
      </article>
    </main>
  );
}
