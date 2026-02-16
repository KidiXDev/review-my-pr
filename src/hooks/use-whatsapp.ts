import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface WhatsAppStatus {
  qr?: string | null;
  isConnected: boolean;
  isReady: boolean;
  error?: string;
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
