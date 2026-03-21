import { LinkForm } from "@/components/dashboard/LinkForm";

export default function NewLinkPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium text-text-primary mb-1">Create a Link</h2>
        <p className="text-sm text-text-muted">
          Your smart link will route visitors to the right destination automatically.
        </p>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6">
        <LinkForm />
      </div>
    </div>
  );
}
