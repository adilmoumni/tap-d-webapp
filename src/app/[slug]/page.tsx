import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getLinkBySlugServer, logClickServer } from "@/lib/db/bio-server";
import { detectDevice } from "@/lib/device";

/* ------------------------------------------------------------------
   Smart link redirect: /slug → detect device, redirect, log click.
   Bio pages are handled by /u/[username] via middleware rewrite.
------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function SlugPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const link = await getLinkBySlugServer(slug);
  if (!link) notFound();

  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const device = detectDevice(ua);

  const destination =
    device === "ios" && link.urlIOS ? link.urlIOS :
    device === "android" && link.urlAndroid ? link.urlAndroid :
    link.urlDesktop;

  const country = headersList.get("x-vercel-ip-country") ?? undefined;
  const refHeader = headersList.get("referer") ?? "";
  let referrer: string | undefined;
  try { if (refHeader) referrer = new URL(refHeader).hostname; } catch { /* ignore */ }

  logClickServer({ linkId: link.id, uid: link.uid, device, country, referrer }).catch(() => {});
  redirect(destination);
}
