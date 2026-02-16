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
import { SearchableSelect } from "@/components/common/modal/searchable-select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useSavedGroups } from "@/hooks/use-groups";
import { useSendTestMessage } from "@/hooks/use-whatsapp";
import { useDebounce } from "use-debounce";

export function TestMessageCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const { data: groups = [], isLoading: fetchingGroups } =
    useSavedGroups(debouncedSearch);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState(
    "This is a test notification from Review My PR bot.",
  );

  const sendMessage = useSendTestMessage();

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
          <SearchableSelect
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            options={groups.map((g) => ({
              value: g.groupId,
              label: g.name,
            }))}
            placeholder="Select a group"
            className="flex-1 w-full"
            disabled={fetchingGroups}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            shouldFilter={false}
          />
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
