import LinkRedirectClient from "./LinkRedirectClient";

export async function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default function OldLinkSlug() {
  return <LinkRedirectClient />;
}
