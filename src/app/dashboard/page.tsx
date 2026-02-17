"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RepoList } from "@/components/dashboard/repo-list";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TestMessageCard } from "@/components/dashboard/test-message-card";
import { useStats } from "@/hooks/use-stats";
import { GitBranch, MessageSquare, Signal, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="flex flex-col gap-8 pb-8">
      <DashboardHeader
        heading="Dashboard"
        text="Overview of your repositories and WhatsApp connection."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-2">
        <StatsCard
          title="WhatsApp Status"
          value={
            isLoading
              ? "..."
              : stats?.whatsapp.isConnected
                ? "Connected"
                : "Disconnected"
          }
          description={stats?.whatsapp.isReady ? "Ready to send" : "Not ready"}
          icon={Signal}
          className={
            stats?.whatsapp.isConnected
              ? "border-emerald-500/50"
              : "border-rose-500/50"
          }
        />
        <StatsCard
          title="Active Repositories"
          value={isLoading ? "..." : stats?.repos.active || 0}
          description="Total repositories monitored"
          icon={GitBranch}
        />
        <StatsCard
          title="Active Groups"
          value={isLoading ? "..." : stats?.groups.total || 0}
          description="Connected WhatsApp groups"
          icon={Users}
        />
        <StatsCard
          title="Total Events"
          value={isLoading ? "..." : stats?.events.last24h || 0}
          description="Processed in last 24h"
          icon={MessageSquare}
        />
      </div>

      <div className="px-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Webhook events and messages delivered over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-chart-1" />
                Events
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-chart-2" />
                Messages
              </div>
            </div>
            <ActivityChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-2">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>
              Manage your connected GitHub repositories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RepoList />
          </CardContent>
        </Card>
        <div className="col-span-3 flex flex-col gap-4">
          <TestMessageCard />
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and connections.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
