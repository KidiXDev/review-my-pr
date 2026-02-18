import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export interface SavedGroup {
  id: string;
  name: string;
  groupId: string;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
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
export interface UpdateGroupParams {
  groupId: string;
  isActive: boolean;
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateGroupParams) => {
      const { data } = await api.patch("/groups", params);
      return data;
    },
    onSuccess: () => {
      toast.success("Group settings saved");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: () => {
      toast.error("Failed to save group settings");
    },
  });
}
