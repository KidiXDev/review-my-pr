import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface GroupParticipant {
  id: string;
  phone: string;
  name: string;
}

export function useGroupParticipants(groupIds: string[]) {
  const sortedIds = [...groupIds].sort().join(",");

  return useQuery<GroupParticipant[]>({
    queryKey: ["whatsapp", "participants", sortedIds],
    queryFn: async () => {
      if (!sortedIds) return [];
      const { data } = await api.get("/whatsapp/groups/participants", {
        params: { groupIds: sortedIds },
      });
      return data;
    },
    enabled: groupIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
