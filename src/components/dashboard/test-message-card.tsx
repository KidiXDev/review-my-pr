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
import { Loader2, Send, CheckCircle2, MessageCircle } from "lucide-react";
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

  const selectedGroupName =
    groups.find((g) => g.groupId === selectedGroup)?.name ?? "";

  const sendTest = () => {
    if (!selectedGroup) return toast.error("Please select a group");
    sendMessage.mutate({ groupId: selectedGroup, message });
  };

  return (
    <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md relative overflow-hidden group">
      {sendMessage.isSuccess && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 animate-in fade-in duration-500 z-20" />
      )}

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-400" />
              Test Integration
            </CardTitle>
            <CardDescription className="mt-1">
              Verify your bot can deliver to WhatsApp groups.
            </CardDescription>
          </div>
          {sendMessage.isSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-in fade-in slide-in-from-right-2 duration-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sent
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Target Group</Label>
          <SearchableSelect
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            options={groups.map((g) => ({
              value: g.groupId,
              label: g.name,
            }))}
            placeholder="Select a group"
            className="flex-1 w-full bg-background/50 border-white/10"
            disabled={fetchingGroups}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            shouldFilter={false}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Message</Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="text-sm bg-background/50 border-white/10 focus-visible:ring-indigo-500/50"
          />
        </div>

        <Button
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300"
          onClick={sendTest}
          disabled={sendMessage.isPending || !selectedGroup}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {sendMessage.isPending
            ? "Sending..."
            : `Send to ${selectedGroupName || "Group"}`}
        </Button>
      </CardContent>
    </Card>
  );
}
