"use client";

import { useRepos } from "@/hooks/use-repos";
import { useSavedGroups } from "@/hooks/use-groups";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { GitBranch, MessageSquare, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "repo" | "group";
  title: string;
  description: string;
  timestamp: Date;
}

export function RecentActivity() {
  const { data: repos, isLoading: isLoadingRepos } = useRepos();
  const { data: groups, isLoading: isLoadingGroups } = useSavedGroups();

  const isLoading = isLoadingRepos || isLoadingGroups;

  const activities: ActivityItem[] = [
    ...(repos?.map((repo) => ({
      id: repo.id,
      type: "repo" as const,
      title: "Repository Connected",
      description: `Connected ${repo.repoName}`,
      timestamp: new Date(repo.createdAt),
    })) || []),
    ...(groups?.map((group) => ({
      id: group.id,
      type: "group" as const,
      title: "Group Added",
      description: `Added WhatsApp group: ${group.name}`,
      timestamp: new Date(group.createdAt),
    })) || []),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
        <div className="p-3 rounded-full bg-white/5 border border-white/5 mb-3">
          <ActivityIcon className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No recent activity
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Connect repositories or groups to see them here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg p-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="mt-1 relative">
              <Avatar className="h-9 w-9 border border-white/10 group-hover:border-primary/20 transition-colors">
                <AvatarFallback
                  className={cn(
                    "bg-background/50",
                    activity.type === "repo"
                      ? "text-blue-400 group-hover:text-blue-300"
                      : "text-emerald-400 group-hover:text-emerald-300",
                  )}
                >
                  {activity.type === "repo" ? (
                    <GitBranch className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-background",
                  activity.type === "repo"
                    ? "bg-blue-500 text-white"
                    : "bg-emerald-500 text-white",
                )}
              >
                <Plus className="h-3 w-3" />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-foreground/90 group-hover:text-foreground transition-colors">
                {activity.title}
              </p>
              <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground/60 pt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function ActivityIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
