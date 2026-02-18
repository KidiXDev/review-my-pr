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
} from "@/components/ui/input-group";
import { MentionTextarea } from "@/components/dashboard/mention-textarea";
import { useGroupParticipants } from "@/hooks/use-group-participants";
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
  X,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedGroups } from "@/hooks/use-groups";
import { useUpdateRepoSettings } from "@/hooks/use-repos";
import { Badge } from "@/components/ui/badge";

interface RepoSettingsDialogProps {
  repo: {
    id: string;
    repoName: string;
    allowedEvents: string[] | null;
    allowedAuthors: string[] | null;
    groupIds: string[] | null;
    messageTemplate: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_EVENTS = [
  { id: "pull_request:opened", label: "PR Opened" },
  { id: "pull_request:reopened", label: "PR Reopened" },
  { id: "pull_request:merged", label: "PR Merged" },
  { id: "pull_request:closed", label: "PR Closed" },
  { id: "pull_request:review_requested", label: "Review Requested" },
];

// Helper to migrate old event IDs to new format
const migrateEvents = (events: string[] | null) => {
  if (!events) return [];
  const map: Record<string, string> = {
    pr_opened: "pull_request:opened",
    pr_reopened: "pull_request:reopened",
    pr_merged: "pull_request:merged",
    pr_closed: "pull_request:closed",
    review_requested: "pull_request:review_requested",
  };
  return events.map((e) => map[e] || e);
};

interface AllowedAuthorsListInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  isInvalid?: boolean;
  errors?: ({ message?: string } | undefined)[];
}

function AllowedAuthorsListInput({
  value,
  onChange,
  isInvalid,
  errors,
}: AllowedAuthorsListInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !value.includes(val)) {
        onChange([...value, val]);
        setInputValue("");
      }
    }
  };

  const removeAuthor = (authorToRemove: string) => {
    onChange(value.filter((a) => a !== authorToRemove));
  };

  return (
    <Field data-invalid={isInvalid}>
      <div className="flex items-center gap-2 mb-1">
        <UserCheck className="w-4 h-4 text-zinc-400" />
        <FieldLabel className="text-base font-semibold">
          Allowed Authors
        </FieldLabel>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 min-h-12">
          {value.map((author) => (
            <Badge
              key={author}
              variant="secondary"
              className="flex items-center gap-1 pr-1 bg-white dark:bg-zinc-800 shadow-sm border-zinc-200 dark:border-zinc-700"
            >
              {author}
              <button
                type="button"
                onClick={() => removeAuthor(author)}
                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-zinc-500" />
              </button>
            </Badge>
          ))}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type username & press Enter..."
            className="flex-1 min-w-[150px] border-none bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-zinc-400"
          />
        </div>
      </div>
      <FieldDescription className="flex items-center gap-1.5 mt-2">
        <Info className="w-3 h-3" />
        Only notifications from these authors will be sent. Leave empty to allow
        all.
      </FieldDescription>
      {isInvalid && errors && <FieldError errors={errors} />}
    </Field>
  );
}

export function RepoSettingsDialog({
  repo,
  open,
  onOpenChange,
}: RepoSettingsDialogProps) {
  const { data: groups = [], isLoading: fetchingGroups } = useSavedGroups();
  const updateSettingsMutation = useUpdateRepoSettings();

  const [groupSearch, setGroupSearch] = useState("");
  const [trackedGroupIds, setTrackedGroupIds] = useState<string[]>(
    repo.groupIds || [],
  );

  const form = useForm({
    defaultValues: {
      allowedEvents: migrateEvents(repo.allowedEvents),
      allowedAuthors: repo.allowedAuthors || [],
      groupIds: repo.groupIds || [],
      messageTemplate: repo.messageTemplate || "",
    } as RepoSettingsFormValues,
    validators: {
      onSubmit: repoSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const allowed = value.allowedEvents || [];
      const authors = value.allowedAuthors || [];
      const grps = value.groupIds || [];
      const tpl = value.messageTemplate || "";

      await updateSettingsMutation.mutateAsync({
        id: repo.id,
        allowedEvents: allowed.length > 0 ? allowed : null,
        allowedAuthors: authors.length > 0 ? authors : null,
        groupIds: grps,
        messageTemplate: tpl || null,
      });
      onOpenChange(false);
      setGroupSearch("");
    },
  });

  const savedGroupIdsForParticipants = useMemo(() => {
    return groups
      .filter((g) => trackedGroupIds.includes(g.groupId))
      .map((g) => g.groupId);
  }, [groups, trackedGroupIds]);

  const { data: participants = [] } = useGroupParticipants(
    savedGroupIdsForParticipants,
  );

  useEffect(() => {
    if (open) {
      form.reset();
      // Explicitly set values to ensure migration applies if defaultValues are stale
      form.setFieldValue("allowedEvents", migrateEvents(repo.allowedEvents));
      form.setFieldValue("allowedAuthors", repo.allowedAuthors || []);
      form.setFieldValue("groupIds", repo.groupIds || []);
      form.setFieldValue("allowedAuthors", repo.allowedAuthors || []);
      form.setFieldValue("groupIds", repo.groupIds || []);
      form.setFieldValue("messageTemplate", repo.messageTemplate || "");

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrackedGroupIds(repo.groupIds || []);
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

          {/* Allowed Authors */}
          <form.Field name="allowedAuthors">
            {(field) => (
              <AllowedAuthorsListInput
                value={field.state.value || []}
                onChange={(val) => field.handleChange(val)}
                isInvalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errors={field.state.meta.errors}
              />
            )}
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
                                    const next = [
                                      ...(field.state.value || []),
                                      group.groupId,
                                    ];
                                    field.handleChange(next);
                                    setTrackedGroupIds(next);
                                  } else {
                                    const next =
                                      field.state.value?.filter(
                                        (value) => value !== group.groupId,
                                      ) || [];
                                    field.handleChange(next);
                                    setTrackedGroupIds(next);
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
                      <MentionTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(val) => field.handleChange(val)}
                        participants={participants}
                        groups={groups}
                        placeholder="*{pr.repo}*: {pr.title}... Type @ to mention"
                        className="font-mono text-sm h-32 max-h-32"
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
                          { m: "@number", d: "Mention" },
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
