"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import {
  RepoSettingsFormValues,
  repoSettingsSchema,
} from "@/schema/repo-settings";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/common/modal/base-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
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

  const form = useForm({
    defaultValues: {
      allowedEvents: repo.allowedEvents || [],
      groupIds: repo.groupIds || [],
      messageTemplate: repo.messageTemplate || "",
    } as RepoSettingsFormValues,
    validators: {
      onSubmit: repoSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const allowed = value.allowedEvents || [];
      const grps = value.groupIds || [];
      const tpl = value.messageTemplate || "";

      await updateSettingsMutation.mutateAsync({
        id: repo.id,
        allowedEvents: allowed.length > 0 ? allowed : null,
        groupIds: grps,
        messageTemplate: tpl || null,
      });
      onOpenChange(false);
      setGroupSearch("");
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, repo, form]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch) return groups;
    const search = groupSearch.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(search) ||
        g.groupId.toLowerCase().includes(search),
    );
  }, [groups, groupSearch]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGroupSearch("");
    }
    onOpenChange(newOpen);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Settings2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold">Repository Settings</span>
        </div>
      }
      description={
        <span>
          Configure how{" "}
          <span className="font-semibold text-foreground">{repo.repoName}</span>{" "}
          notifications are handled.
        </span>
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleOpenChange(false)}
            className="hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            form="repo-settings-form"
            className="min-w-32 shadow-lg shadow-primary/20"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      }
    >
      <form
        id="repo-settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <FieldGroup>
          <form.Field name="allowedEvents">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-zinc-400" />
                    <FieldLabel className="text-base font-semibold">
                      Allowed Events
                    </FieldLabel>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    {AVAILABLE_EVENTS.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex flex-row items-center space-x-3 space-y-0 p-2 rounded-lg transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                          field.state.value?.includes(event.id) &&
                            "bg-primary/5 border-primary/10",
                        )}
                      >
                        <Checkbox
                          id={`event-${event.id}`}
                          checked={field.state.value?.includes(event.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.handleChange([
                                ...(field.state.value || []),
                                event.id,
                              ]);
                            } else {
                              field.handleChange(
                                field.state.value?.filter(
                                  (value) => value !== event.id,
                                ),
                              );
                            }
                          }}
                        />
                        <FieldLabel
                          htmlFor={`event-${event.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                        >
                          {event.label}
                        </FieldLabel>
                      </div>
                    ))}
                  </div>
                  <FieldDescription className="flex items-center gap-1.5 mt-2">
                    <Info className="w-3 h-3" />
                    If none selected, no notifications will be sent.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Target Groups */}
          <form.Field name="groupIds">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <FieldLabel className="text-base font-semibold">
                      Target Groups
                    </FieldLabel>
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
                          {filteredGroups.map((group) => (
                            <div
                              key={group.id}
                              className={cn(
                                "flex flex-row items-center space-x-3 space-y-0 p-2.5 rounded-lg transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                                field.state.value?.includes(group.groupId)
                                  ? "bg-primary/10 text-primary"
                                  : "text-zinc-600 dark:text-zinc-400",
                              )}
                            >
                              <Checkbox
                                id={`group-${group.groupId}`}
                                checked={field.state.value?.includes(
                                  group.groupId,
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.handleChange([
                                      ...(field.state.value || []),
                                      group.groupId,
                                    ]);
                                  } else {
                                    field.handleChange(
                                      field.state.value?.filter(
                                        (value) => value !== group.groupId,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <FieldLabel
                                htmlFor={`group-${group.groupId}`}
                                className="text-sm font-medium leading-none truncate cursor-pointer flex-1 py-1"
                              >
                                {group.name}
                              </FieldLabel>
                            </div>
                          ))}
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
                  <FieldDescription className="flex items-center gap-1.5 mt-2">
                    <Info className="w-3 h-3" />
                    Select groups to receive notifications. If none selected,
                    defaults to all active groups.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Message Template */}
          <form.Field name="messageTemplate">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <FieldLabel className="text-base font-semibold">
                      Message Template
                    </FieldLabel>
                  </div>
                  <div className="space-y-3">
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="*{pr.repo}*: {pr.title}..."
                        className="font-mono max-h-32 text-sm h-32 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50 focus-visible:ring-primary/20"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {(field.state.value || "").length}/500 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
    </BaseDialog>
  );
}
