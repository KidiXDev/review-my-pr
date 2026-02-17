"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RepoList } from "@/components/dashboard/repo-list";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TestMessageCard } from "@/components/dashboard/test-message-card";
import { StatusCard } from "@/components/dashboard/status-card";
import { useStats } from "@/hooks/use-stats";
import {
  GitBranch,
  MessageSquare,
  Signal,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          heading="Dashboard"
          text="Overview of your repositories and WhatsApp connection."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        {/* Row 1: Key Metrics */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="WhatsApp Status"
            value={
              isLoading
                ? "..."
                : stats?.whatsapp.isConnected
                  ? "Connected"
                  : "Disconnected"
            }
            description={
              stats?.whatsapp.isReady ? "Ready to send" : "Not ready"
            }
            icon={Signal}
            className={
              stats?.whatsapp.isConnected
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }
            index={0}
          />
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Active Repositories"
            value={isLoading ? "..." : stats?.repos.active || 0}
            description="Total repositories monitored"
            icon={GitBranch}
            index={1}
          />
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Active Groups"
            value={isLoading ? "..." : stats?.groups.total || 0}
            description="Connected WhatsApp groups"
            icon={Users}
            index={2}
          />
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Events"
            value={isLoading ? "..." : stats?.events.last24h || 0}
            description="Processed in last 24h"
            icon={MessageSquare}
            index={3}
          />
        </div>

        {/* Row 2: Charts & Activity */}

        <div className="col-span-1 md:col-span-12">
          <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>
                    Webhook events and messages delivered over the last 7 days.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 border border-white/5">
                    <span className="inline-block h-2 w-2 rounded-full bg-chart-1 shadow-[0_0_8px_var(--color-chart-1)]" />
                    <span className="text-muted-foreground">Events</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 border border-white/5">
                    <span className="inline-block h-2 w-2 rounded-full bg-chart-2 shadow-[0_0_8px_var(--color-chart-2)]" />
                    <span className="text-muted-foreground">Messages</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ActivityChart />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-4 rounded-xl overflow-hidden p-0 sm:p-0">
          {stats?.whatsapp.isConnected ? <TestMessageCard /> : <StatusCard />}
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-8 h-full">
          <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Activity
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </CardTitle>
              <CardDescription>Latest actions and connections.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Repo List */}
        <div className="col-span-1 md:col-span-12">
          <Card className="border-white/5 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Repositories</CardTitle>
                <CardDescription>
                  Manage your connected GitHub repositories.
                </CardDescription>
              </div>
              <Link href="/dashboard/repos">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  View All <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <RepoList />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
