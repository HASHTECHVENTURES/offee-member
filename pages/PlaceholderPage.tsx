import { PageHeader } from "@/components/design-system/page-header";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description ?? ""} />
    </div>
  );
}
