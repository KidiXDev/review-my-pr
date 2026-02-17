import { useRepos } from "@/hooks/use-repos";
import { useSavedGroups } from "@/hooks/use-groups";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { GitBranch, MessageSquare } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "repo" | "group";
  title: string;
  description: string;
  timestamp: Date;
}

export function RecentActivity() {
  const { data: repos } = useRepos();
  const { data: groups } = useSavedGroups();

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
    .slice(0, 5);

  if (!activities.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className={
                activity.type === "repo"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-green-500/10 text-green-500"
              }
            >
              {activity.type === "repo" ? (
                <GitBranch className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
          </div>
          <div className="ml-auto font-medium text-xs text-muted-foreground">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
