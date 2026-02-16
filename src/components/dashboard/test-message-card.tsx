"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useWhatsAppGroups, useSendTestMessage } from "@/hooks/use-whatsapp";

export function TestMessageCard() {
  const {
    data: groups = [],
    isRefetching: fetchingGroups,
    refetch,
  } = useWhatsAppGroups(false);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState(
    "This is a test notification from Review My PR bot.",
  );

  const sendMessage = useSendTestMessage();

  const handleFetchGroups = async () => {
    const { data } = await refetch();
    if (data && data.length > 0) {
      setSelectedGroup(data[0].id);
      toast.success("Groups fetched successfully");
    }
  };

  const sendTest = () => {
    if (!selectedGroup) return toast.error("Please select a group");
    sendMessage.mutate({ groupId: selectedGroup, message });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Test Message</CardTitle>
        <CardDescription>
          Verify your bot can send messages to groups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Target Group</Label>
          <div className="flex gap-2">
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              disabled={fetchingGroups || groups.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleFetchGroups}
              disabled={fetchingGroups}
            >
              <Loader2
                className={`h-4 w-4 ${fetchingGroups ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          {groups.length === 0 && !fetchingGroups && (
            <p className="text-xs text-muted-foreground">
              Click refresh to load groups
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        <Button
          className="w-full"
          onClick={sendTest}
          disabled={sendMessage.isPending || !selectedGroup}
        >
          {sendMessage.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Test Notification
        </Button>
      </CardContent>
    </Card>
  );
}
