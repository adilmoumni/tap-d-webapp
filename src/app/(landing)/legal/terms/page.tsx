import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | tap-d.link" },
  description: "Terms of Service for tap-d.link.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <main className="pt-28 pb-16 px-6">
      <article className="mx-auto max-w-[860px] rounded-[18px] border border-[#e8e6e2] bg-white p-6 sm:p-10">
        <h1 className="text-3xl font-semibold text-[#1a1a2e] mb-3">Terms of Service</h1>
        <p className="text-sm text-[#7a7a8e] mb-8">Last updated: March 24, 2026</p>

        <div className="space-y-5 text-[15px] leading-7 text-[#333547]">
          <p>
            By using tap-d.link, you agree not to publish malware, phishing, impersonation, or deceptive content.
          </p>
          <p>
            You are responsible for all links and media you publish under your account.
            We may suspend or remove content that violates these terms or applicable law.
          </p>
          <p>
            The service is provided on an as-is basis. We may update features and policies over time.
          </p>
          <p>
            If you have legal or compliance questions, contact: <a className="underline" href="mailto:hello@tap-d.link">hello@tap-d.link</a>.
          </p>
        </div>
      </article>
    </main>
  );
}
