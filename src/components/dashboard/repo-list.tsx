import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRepos } from "@/hooks/use-repos";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Connected At</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repos.map((repo) => (
            <TableRow key={repo.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  {repo.repoName}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={repo.isActive ? "default" : "secondary"}>
                  {repo.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(repo.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
