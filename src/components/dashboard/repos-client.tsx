"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Copy, Settings } from "lucide-react";
import { toast } from "sonner";
import { RepoSettingsDialog } from "./repo-settings-dialog";
import { useAlert } from "@/components/providers/alert-provider";
import {
  useRepos,
  useAddRepo,
  useDeleteRepo,
  Repository,
} from "@/hooks/use-repos";

import { DashboardHeader } from "./dashboard-header";

export function ReposClient() {
  const { data: repos = [], isLoading: loading } = useRepos();
  const addRepoMutation = useAddRepo();
  const deleteRepoMutation = useDeleteRepo();
  const { confirm } = useAlert();

  const [addOpen, setAddOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  // Settings Dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const handleAddRepo = async () => {
    if (!newRepoName.includes("/")) {
      return toast.error("Please use format: owner/repo");
    }
    await addRepoMutation.mutateAsync(newRepoName);
    setAddOpen(false);
    setNewRepoName("");
  };

  const handleDeleteRepo = async (id: string) => {
    const ok = await confirm({
      title: "Delete Repository",
      description:
        "Are you sure you want to delete this repository? This action cannot be undone and will stop all notifications for this repository.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (!ok) return;
    await deleteRepoMutation.mutateAsync(id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openSettings = (repo: Repository) => {
    setSelectedRepo(repo);
    setSettingsOpen(true);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Repositories"
        text="Connect your GitHub repositories to receive real-time WhatsApp notifications for PRs and issues."
        showAction={false}
      >
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add GitHub Repository</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Repository Name (owner/repo)</Label>
                <Input
                  placeholder="e.g. facebook/react"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: owner/repo-name
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddRepo}
                disabled={addRepoMutation.isPending || !newRepoName}
              >
                {addRepoMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Repository
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Authorized Repositories</CardTitle>
          <CardDescription>
            These repositories are allowed to trigger WhatsApp notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>API Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : repos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No repositories added.
                  </TableCell>
                </TableRow>
              ) : (
                repos.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell className="font-medium">
                      {repo.repoName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {repo.apiToken.substring(0, 8)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(repo.apiToken)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {repo.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(repo.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSettings(repo)}
                          title="Settings"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRepo(repo.id)}
                          disabled={
                            deleteRepoMutation.isPending &&
                            deleteRepoMutation.variables === repo.id
                          }
                          title="Delete"
                        >
                          {deleteRepoMutation.isPending &&
                          deleteRepoMutation.variables === repo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {repos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
            <CardDescription>
              How to send notifications from GitHub Actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">
                {`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/notify/github \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${repos[0]?.apiToken || "YOUR_API_TOKEN"}",
    "event": "pr_opened",
    "repo": "${repos[0]?.repoName || "owner/repo"}",
    "title": "New PR: Feature X",
    "author": "octocat",
    "url": "https://github.com/..."
  }'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRepo && (
        <RepoSettingsDialog
          repo={selectedRepo}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}
    </div>
  );
}
