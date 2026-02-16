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

interface Group {
  id: string;
  name: string;
}

export function TestMessageCard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState(
    "This is a test notification from Review My PR bot.",
  );
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(false);

  const fetchGroups = async () => {
    setFetchingGroups(true);
    try {
      const res = await fetch("/api/whatsapp/groups");
      const data = await res.json();
      if (res.ok) {
        setGroups(data);
        if (data.length > 0) setSelectedGroup(data[0].id);
        toast.success("Groups fetched successfully");
      } else {
        toast.error(data.error || "Failed to fetch groups");
      }
    } catch (err) {
      toast.error("Failed to fetch groups");
    } finally {
      setFetchingGroups(false);
    }
  };

  const sendTest = async () => {
    if (!selectedGroup) return toast.error("Please select a group");
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup, message }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Message sent!");
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
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
              onClick={fetchGroups}
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
          disabled={loading || !selectedGroup}
        >
          {loading ? (
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
