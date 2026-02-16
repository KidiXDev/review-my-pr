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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useWhatsAppGroups,
  useSaveWhatsAppGroup,
  WaGroup,
} from "@/hooks/use-whatsapp";
import { useSavedGroups } from "@/hooks/use-groups";

export function GroupsClient() {
  const [syncOpen, setSyncOpen] = useState(false);

  const { data: savedGroups = [], isLoading: loading } = useSavedGroups();
  const {
    data: waGroups = [],
    isFetching: syncLoading,
    refetch: fetchWaGroups,
  } = useWhatsAppGroups(false);

  const saveGroupMutation = useSaveWhatsAppGroup();

  const handleSyncClick = () => {
    fetchWaGroups();
  };

  const handleSaveGroup = async (group: WaGroup) => {
    await saveGroupMutation.mutateAsync({
      groupId: group.id,
      name: group.name,
    });
    setSyncOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">WhatsApp Groups</h2>
        <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleSyncClick}>
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
                      const isSaving =
                        saveGroupMutation.isPending &&
                        saveGroupMutation.variables?.groupId === g.id;

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
                            onClick={() => handleSaveGroup(g)}
                            disabled={isAlreadySaved || isSaving}
                            variant={isAlreadySaved ? "secondary" : "default"}
                          >
                            {isSaving ? (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : savedGroups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
