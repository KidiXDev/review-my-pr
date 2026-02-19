"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Github,
  MessageCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useWhatsAppStatus,
  useWhatsAppGroups,
  useSaveWhatsAppGroup,
  useRetryWhatsApp,
  WaGroup,
} from "@/hooks/use-whatsapp";

import { useRepos, useAddRepo } from "@/hooks/use-repos";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ConnectStep({ onNext, onBack }: StepProps) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "github">("whatsapp");

  // WhatsApp State
  const { data: waStatus, isLoading: waLoading } = useWhatsAppStatus();
  const { data: waGroups = [], isLoading: groupsLoading } = useWhatsAppGroups(
    !!waStatus?.isConnected,
  );
  const saveGroupMutation = useSaveWhatsAppGroup();
  const retryMutation = useRetryWhatsApp();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSearchQuery, setImportSearchQuery] = useState("");

  // Determine WhatsApp readiness
  const isWhatsAppConnected = !!waStatus?.isConnected;
  const hasImportedGroup = waGroups.some((g) => g.isImported);
  const isWhatsAppReady = isWhatsAppConnected && hasImportedGroup;

  // GitHub State
  const { data: repos = [], isLoading: reposLoading } = useRepos();
  const addRepoMutation = useAddRepo();
  const [repoName, setRepoName] = useState("");

  const handleSaveGroup = async (group: WaGroup) => {
    try {
      await saveGroupMutation.mutateAsync({
        groupId: group.id,
        name: group.name,
      });
      toast.success("WhatsApp group connected!");
      setImportDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRepo = async () => {
    if (!repoName.includes("/")) {
      toast.error("Format must be owner/repo");
      return;
    }
    try {
      await addRepoMutation.mutateAsync(repoName);
      setRepoName("");
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Connect Your Accounts</h2>
        <p className="text-muted-foreground">
          Link your WhatsApp to receive notifications, then connect GitHub to
          track your work.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === "whatsapp"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50",
          )}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
          {isWhatsAppReady && (
            <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />
          )}
        </button>
        <button
          onClick={() => isWhatsAppReady && setActiveTab("github")}
          disabled={!isWhatsAppReady}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
            activeTab === "github"
              ? "bg-background text-foreground shadow-sm"
              : !isWhatsAppReady
                ? "opacity-50 cursor-not-allowed text-muted-foreground"
                : "text-muted-foreground hover:bg-background/50",
          )}
        >
          <Github className="w-4 h-4" />
          GitHub
        </button>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "whatsapp" ? (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    WhatsApp Connection
                  </CardTitle>
                  <CardDescription>
                    Scan the QR code to connect, then select a group to receive
                    notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {waLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : waStatus?.isConnected ? (
                    <div className="space-y-6">
                      <div className="bg-green-500/10 text-green-600 p-4 rounded-lg flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6" />
                        <div className="font-medium">WhatsApp Connected</div>
                      </div>

                      {/* {hasImportedGroup && (
                        <div className="bg-blue-500/10 text-blue-600 p-4 rounded-lg flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6" />
                          <div className="font-medium">
                            Group Configured (
                            {waGroups.filter((g) => g.isImported).length}{" "}
                            active)
                          </div>
                        </div>
                      )} */}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>WhatsApp Groups</Label>
                          <Dialog
                            open={importDialogOpen}
                            onOpenChange={setImportDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={groupsLoading}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Import Group
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                              <DialogHeader>
                                <DialogTitle>
                                  Select Group to Import
                                </DialogTitle>
                                <div className="pt-2">
                                  <InputGroup>
                                    <InputGroupAddon>
                                      <Search className="h-4 w-4" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                      placeholder="Search WhatsApp groups..."
                                      value={importSearchQuery}
                                      onChange={(e) =>
                                        setImportSearchQuery(e.target.value)
                                      }
                                    />
                                  </InputGroup>
                                </div>
                              </DialogHeader>
                              <div className="flex-1 overflow-hidden">
                                {groupsLoading ? (
                                  <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  </div>
                                ) : (
                                  <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-2">
                                      {waGroups
                                        .filter((g) => !g.isImported)
                                        .filter((g) =>
                                          g.name
                                            .toLowerCase()
                                            .includes(
                                              importSearchQuery.toLowerCase(),
                                            ),
                                        )
                                        .map((group) => {
                                          const isSaving =
                                            saveGroupMutation.isPending &&
                                            saveGroupMutation.variables
                                              ?.groupId === group.id;

                                          return (
                                            <div
                                              key={group.id}
                                              className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground"
                                            >
                                              <div>
                                                <p className="font-medium">
                                                  {group.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {group.participantCount}{" "}
                                                  participants
                                                </p>
                                              </div>
                                              <Button
                                                size="sm"
                                                onClick={() =>
                                                  handleSaveGroup(group)
                                                }
                                                disabled={isSaving}
                                              >
                                                {isSaving ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                  "Import"
                                                )}
                                              </Button>
                                            </div>
                                          );
                                        })}
                                      {waGroups.filter((g) => !g.isImported)
                                        .length === 0 && (
                                        <p className="text-center text-muted-foreground p-4">
                                          No new groups found.
                                        </p>
                                      )}
                                    </div>
                                  </ScrollArea>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {waGroups.some((g) => g.isImported) ? (
                          <div className="space-y-2">
                            {waGroups
                              .filter((g) => g.isImported)
                              .map((group) => (
                                <div
                                  key={group.id}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-green-500" />
                                    <span className="font-medium">
                                      {group.name}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-600 border-green-500/20"
                                  >
                                    Connected
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                            No groups connected yet. Click &quot;Import
                            Group&quot; to start.
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Connect at least one group where the bot will send
                          notifications to proceed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 space-y-4">
                      {waStatus?.isExpired ? (
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
                            <RefreshCw className="h-8 w-8 text-amber-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">QR Code Expired</p>
                            <p className="text-sm text-muted-foreground max-w-xs">
                              The connection attempt timed out. Click below to
                              generate a new QR code.
                            </p>
                          </div>
                          <Button
                            onClick={() => retryMutation.mutate()}
                            disabled={retryMutation.isPending}
                          >
                            {retryMutation.isPending && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Generate New QR
                          </Button>
                        </div>
                      ) : waStatus?.qr ? (
                        <div className="p-4 bg-white rounded-xl shadow-sm border">
                          <QRCodeSVG value={waStatus.qr} size={200} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p>Generating QR Code...</p>
                        </div>
                      )}
                      {!waStatus?.isExpired && (
                        <p className="text-sm text-center text-muted-foreground max-w-xs">
                          Open WhatsApp on your phone, go to Linked Devices, and
                          scan this code.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="github"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    GitHub Repositories
                  </CardTitle>
                  <CardDescription>
                    Add repositories you want to track. (Optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Add Repository</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="owner/repo-name"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                      />
                      <Button
                        onClick={handleAddRepo}
                        disabled={!repoName || addRepoMutation.isPending}
                      >
                        {addRepoMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span className="sr-only sm:not-sr-only sm:ml-2">
                          Add
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Connected Repositories</Label>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      {reposLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : repos.length > 0 ? (
                        <div className="space-y-2">
                          {repos.map((repo) => (
                            <div
                              key={repo.id}
                              className="flex flex-col p-3 bg-muted/50 rounded-lg text-sm gap-2"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2">
                                  <Github className="w-4 h-4" />
                                  {repo.repoName}
                                </div>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    repo.isActive
                                      ? "bg-green-500/10 text-green-600"
                                      : "bg-yellow-500/10 text-yellow-600",
                                  )}
                                >
                                  {repo.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-background p-2 rounded border text-xs text-muted-foreground font-mono">
                                <span className="truncate flex-1">
                                  Token: {repo.apiToken}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => copyToClipboard(repo.apiToken)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No repositories added yet.
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          {!isWhatsAppReady && (
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Connect WhatsApp and import a group to continue
            </span>
          )}
          <Button
            onClick={onNext}
            disabled={!isWhatsAppReady}
            className="group"
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
