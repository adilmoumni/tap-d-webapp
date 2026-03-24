import LinkDetailClient from "./LinkDetailClient";

export async function generateStaticParams() {
  return [{ slug: "placeholder" }];
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default function LinkDetailPage() {
  return <LinkDetailClient />;
}
