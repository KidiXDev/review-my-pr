import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface WhatsAppStatus {
  qr?: string | null;
  isConnected: boolean;
  isReady: boolean;
  error?: string;
}

export interface WaGroup {
  id: string;
  name: string;
  participantCount: number;
}

export function useWhatsAppStatus() {
  return useQuery<WhatsAppStatus>({
    queryKey: ["whatsapp", "status"],
    queryFn: async () => {
      const { data } = await api.get("/whatsapp/qr");
      return data;
    },
    refetchInterval: (query) => {
      // Poll faster if we are waiting for a QR code or initializing
      const data = query.state.data;
      if (data && !data.isReady) {
        return 5000; // 5 seconds
      }
      return 30000; // 30 seconds if ready
    },
  });
}

export function useWhatsAppGroups(enabled = true) {
  return useQuery<WaGroup[]>({
    queryKey: ["whatsapp", "groups"],
    queryFn: async () => {
      const { data } = await api.get("/whatsapp/groups");
      return data;
    },
    enabled,
  });
}

export function useSendTestMessage() {
  return useMutation({
    mutationFn: async ({
      groupId,
      message,
    }: {
      groupId: string;
      message: string;
    }) => {
      const { data } = await api.post("/whatsapp/send-test", {
        groupId,
        message,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Message sent!");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Failed to send message");
    },
  });
}

export function useSaveWhatsAppGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      name,
    }: {
      groupId: string;
      name: string;
    }) => {
      const { data } = await api.post("/whatsapp/groups", { groupId, name });
      return data;
    },
    onSuccess: () => {
      toast.success("Group saved");
      queryClient.invalidateQueries({ queryKey: ["groups", "saved"] });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Failed to save group");
    },
  });
}
