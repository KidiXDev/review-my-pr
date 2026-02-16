import { StatusCard } from "@/components/dashboard/status-card";
import { TestMessageCard } from "@/components/dashboard/test-message-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <StatusCard />
        <TestMessageCard />
      </div>
    </div>
  );
}
