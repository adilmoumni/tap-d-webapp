import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  return [{ username: "placeholder" }];
}

export const dynamic = "force-static";

export default async function DashboardBioPageEditRedirect({ params }: Props) {
  const { username } = await params;
  redirect(`/d/biopages/${encodeURIComponent(username)}/edit`);
}
