import BioClientPage from "./BioClientPage";

export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default function Page({ params }: { params: any }) {
  return <BioClientPage params={params} />;
}
