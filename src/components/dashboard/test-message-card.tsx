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

  const sendTest = () => {
    if (!selectedGroup) return toast.error("Please select a group");
    sendMessage.mutate({ groupId: selectedGroup, message });
  };

  return (
    <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md relative overflow-hidden group flex flex-col">
      {sendMessage.isSuccess && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)] animate-in fade-in duration-500 z-20" />
      )}

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-400" />
              Test Integration
            </CardTitle>
            <CardDescription className="mt-1">
              Verify your bot can deliver messages.
            </CardDescription>
          </div>
          {sendMessage.isSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-in fade-in slide-in-from-right-2 duration-300 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sent
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6 flex-1">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Target Group
          </Label>
          <SearchableSelect
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            options={groups.map((g) => ({
              value: g.groupId,
              label: g.name,
            }))}
            placeholder="Select a group..."
            className="w-full bg-black/20 border-white/10 hover:border-white/20 transition-colors focus:ring-indigo-500/20"
            disabled={fetchingGroups}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            shouldFilter={false}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Message Content
          </Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-black/20 border-white/10 hover:border-white/20 transition-colors focus-visible:ring-indigo-500/20"
            placeholder="Type a test message..."
          />
        </div>

        <div className="pt-2">
          <Button
            className="w-full gap-2 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 border-0"
            onClick={sendTest}
            disabled={sendMessage.isPending || !selectedGroup}
            size="lg"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sendMessage.isPending ? "Sending..." : `Send Test Message`}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3">
            This will send a real message to the selected WhatsApp group.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
