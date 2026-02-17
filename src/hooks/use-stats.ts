import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  whatsapp: {
    isConnected: boolean;
    isReady: boolean;
  };
  repos: {
    total: number;
    active: number;
  };
  groups: {
    total: number;
  };
  events: {
    last24h: number;
  };
  timestamp: string;
}

export function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/dashboard/stats");
      return data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}
