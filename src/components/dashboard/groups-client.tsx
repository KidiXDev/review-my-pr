"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedGroup {
  id: string;
  name: string;
  groupId: string;
  isActive: boolean;
  createdAt: string;
}

interface WaGroup {
  id: string;
  name: string;
  participantCount: number;
}

export function GroupsClient() {
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncOpen, setSyncOpen] = useState(false);
  const [waGroups, setWaGroups] = useState<WaGroup[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchSavedGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        setSavedGroups(await res.json());
      }
    } catch (err) {
      toast.error("Failed to fetch saved groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedGroups();
  }, []);

  const fetchWaGroups = async () => {
    setSyncLoading(true);
    try {
      const res = await fetch("/api/whatsapp/groups");
      const data = await res.json();
      if (res.ok) {
        setWaGroups(data);
      } else {
        toast.error(data.error || "Failed to fetch WhatsApp groups");
      }
    } catch (err) {
      toast.error("Failed to fetch WhatsApp groups");
    } finally {
      setSyncLoading(false);
    }
  };

  const saveGroup = async (group: WaGroup) => {
    setSavingId(group.id);
    try {
      const res = await fetch("/api/whatsapp/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.id, name: group.name }),
      });
      if (res.ok) {
        toast.success("Group saved");
        setSyncOpen(false);
        fetchSavedGroups();
      } else {
        toast.error("Failed to save group");
      }
    } catch (err) {
      toast.error("Failed to save group");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">WhatsApp Groups</h2>
        <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
          <DialogTrigger asChild>
            <Button onClick={fetchWaGroups}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync from WhatsApp
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Groups to Import</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {syncLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {waGroups.map((g) => {
                      const isAlreadySaved = savedGroups.some(
                        (sg) => sg.groupId === g.id,
                      );
                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground"
                        >
                          <div>
                            <p className="font-medium">{g.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {g.participantCount} participants
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => saveGroup(g)}
                            disabled={isAlreadySaved || savingId === g.id}
                            variant={isAlreadySaved ? "secondary" : "default"}
                          >
                            {savingId === g.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isAlreadySaved ? (
                              "Saved"
                            ) : (
                              "Import"
                            )}
                          </Button>
                        </div>
                      );
                    })}
                    {waGroups.length === 0 && (
                      <p className="text-center text-muted-foreground p-4">
                        No groups found.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Group ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : savedGroups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No groups saved. Sync from WhatsApp to get started.
                  </TableCell>
                </TableRow>
              ) : (
                savedGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {group.groupId}
                    </TableCell>
                    <TableCell>
                      {group.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell className="text-right">
                       <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
