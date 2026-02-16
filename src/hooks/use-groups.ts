import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SavedGroup {
  id: string;
  name: string;
  groupId: string;
  isActive: boolean;
  createdAt: string;
}

export function useSavedGroups(search?: string) {
  return useQuery<SavedGroup[]>({
    queryKey: ["groups", "saved", search],
    queryFn: async () => {
      const { data } = await api.get("/groups", {
        params: { search },
      });
      return data;
    },
  });
}
