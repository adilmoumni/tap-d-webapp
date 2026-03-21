import { BioEditor } from "@/components/dashboard/BioEditor";

export default function BioPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-1">Bio Page</h2>
        <p className="text-sm text-text-muted">
          Customize your public bio page. Changes are previewed live on the right.
        </p>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6 xl:p-8">
        <BioEditor />
      </div>
    </div>
  );
}
