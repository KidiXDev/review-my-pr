import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SavedGroup {
  id: string;
  name: string;
  groupId: string;
  isActive: boolean;
  createdAt: string;
}

export function useSavedGroups() {
  return useQuery<SavedGroup[]>({
    queryKey: ["groups", "saved"],
    queryFn: async () => {
      const { data } = await api.get("/groups");
      return data;
    },
  });
}
