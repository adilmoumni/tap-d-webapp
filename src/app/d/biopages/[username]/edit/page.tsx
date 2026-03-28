import BioPageEditClient from "./BioPageEditClient";

export async function generateStaticParams() {
  return [{ username: "placeholder" }];
}

export const dynamic = "force-static";

export default function BioPageEditRoute() {
  return <BioPageEditClient />;
}
