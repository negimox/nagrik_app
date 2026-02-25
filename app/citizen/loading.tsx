import { DashboardSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardSkeleton cards={4} />
    </div>
  );
}
