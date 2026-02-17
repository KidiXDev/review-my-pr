import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRepos } from "@/hooks/use-repos";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RepoList() {
  const { data: repos, isLoading } = useRepos();

  if (isLoading) {
    return <RepoListSkeleton />;
  }

  if (!repos?.length) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No repositories</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven&apos;t connected any repositories yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/5 bg-transparent overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-muted-foreground/70">Name</TableHead>
            <TableHead className="text-muted-foreground/70">Status</TableHead>
            <TableHead className="text-muted-foreground/70">
              Connected At
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repos.map((repo, index) => (
            <TableRow
              key={repo.id}
              className="border-white/5 hover:bg-white/5 transition-colors group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <TableCell className="font-medium text-foreground/90 group-hover:text-foreground">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  {repo.repoName}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    repo.isActive
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
                  )}
                >
                  {repo.isActive ? "Active" : "Inactive"}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(repo.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RepoListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <Skeleton className="h-[125px] w-full rounded-xl" />
    </div>
  );
}
