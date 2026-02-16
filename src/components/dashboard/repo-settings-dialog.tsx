"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Settings2,
  Bell,
  Users,
  MessageSquare,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedGroups } from "@/hooks/use-groups";
import { useUpdateRepoSettings } from "@/hooks/use-repos";

interface RepoSettingsDialogProps {
  repo: {
    id: string;
    repoName: string;
    allowedEvents: string[] | null;
    groupIds: string[] | null;
    messageTemplate: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_EVENTS = [
  { id: "pr_opened", label: "PR Opened" },
  { id: "pr_reopened", label: "PR Reopened" },
  { id: "pr_merged", label: "PR Merged" },
  { id: "pr_closed", label: "PR Closed" },
  { id: "review_requested", label: "Review Requested" },
];

export function RepoSettingsDialog({
  repo,
  open,
  onOpenChange,
}: RepoSettingsDialogProps) {
  const { data: groups = [], isLoading: fetchingGroups } = useSavedGroups();
  const updateSettingsMutation = useUpdateRepoSettings();

  const [groupSearch, setGroupSearch] = useState("");

  // Form State
  const [allowedEvents, setAllowedEvents] = useState<string[]>(
    repo.allowedEvents || [],
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    repo.groupIds || [],
  );
  const [template, setTemplate] = useState(repo.messageTemplate || "");

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowedEvents(repo.allowedEvents || []);
      setSelectedGroups(repo.groupIds || []);
      setTemplate(repo.messageTemplate || "");
      setGroupSearch("");
    }
  }, [open, repo]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch) return groups;
    const search = groupSearch.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(search) ||
        g.groupId.toLowerCase().includes(search),
    );
  }, [groups, groupSearch]);

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync({
      id: repo.id,
      allowedEvents: allowedEvents.length > 0 ? allowedEvents : null,
      groupIds: selectedGroups,
      messageTemplate: template || null,
    });
    onOpenChange(false);
  };

  const toggleEvent = (eventId: string) => {
    setAllowedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden dark:bg-zinc-950/90 backdrop-blur-xl border-zinc-200/20 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl">Repository Settings</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Configure how{" "}
            <span className="font-semibold text-foreground">
              {repo.repoName}
            </span>{" "}
            notifications are handled.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-8">
            {/* Allowed Events */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-400" />
                <Label className="text-base font-semibold">
                  Allowed Events
                </Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                {AVAILABLE_EVENTS.map((event) => {
                  const id = `event-${event.id}`;
                  const isChecked = allowedEvents.includes(event.id);
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                        isChecked && "bg-primary/5 border-primary/10",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={isChecked}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <Label
                        htmlFor={id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                      >
                        {event.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                If none selected, no notifications will be sent.
              </p>
            </div>

            {/* Target Groups */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <Label className="text-base font-semibold">
                    Target Groups
                  </Label>
                </div>
              </div>

              {fetchingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : groups.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    No WhatsApp groups found.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search groups..."
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      className="pl-9 h-10 bg-zinc-50/50 dark:bg-zinc-900/20"
                    />
                  </div>

                  <ScrollArea className="h-[200px] w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="grid grid-cols-1 gap-1">
                      {filteredGroups.map((group) => {
                        const id = `group-${group.groupId}`;
                        const isChecked = selectedGroups.includes(
                          group.groupId,
                        );
                        return (
                          <div
                            key={group.id}
                            className={cn(
                              "flex items-center space-x-3 p-2.5 rounded-lg transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                              isChecked
                                ? "bg-primary/10 text-primary"
                                : "text-zinc-600 dark:text-zinc-400",
                            )}
                          >
                            <Checkbox
                              id={id}
                              checked={isChecked}
                              onCheckedChange={() => toggleGroup(group.groupId)}
                            />
                            <Label
                              htmlFor={id}
                              className="text-sm font-medium leading-none truncate cursor-pointer flex-1 py-1"
                            >
                              {group.name}
                            </Label>
                          </div>
                        );
                      })}
                      {filteredGroups.length === 0 && (
                        <div className="py-12 text-center">
                          <p className="text-sm text-zinc-500">
                            No groups match your search
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                Select groups to receive notifications. If none selected,
                defaults to all active groups.
              </p>
            </div>

            {/* Message Template */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <Label className="text-base font-semibold">
                  Message Template
                </Label>
              </div>
              <div className="space-y-3">
                <Textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="📢 *{pr.repo}*: {pr.title}..."
                  className="font-mono text-sm h-32 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 focus-visible:ring-primary/20"
                />
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                    Available Macros
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { m: "{pr.repo}", d: "Repo Name" },
                      { m: "{pr.title}", d: "PR Title" },
                      { m: "{pr.author}", d: "Author" },
                      { m: "{pr.url}", d: "URL" },
                      { m: "{pr.event}", d: "Event" },
                    ].map((macro) => (
                      <div key={macro.m} className="flex flex-col gap-0.5">
                        <code className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                          {macro.m}
                        </code>
                        <span className="text-[10px] text-zinc-500">
                          {macro.d}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="min-w-32 shadow-lg shadow-primary/20"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
