import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface Repository {
  id: string;
  repoName: string;
  apiToken: string;
  isActive: boolean;
  createdAt: string;
  allowedEvents: string[] | null;
  allowedAuthors: string[] | null;
  groupIds: string[] | null;
  messageTemplate: string | null;
  detailedDateLanguage: string | null;
}

export function useRepos() {
  return useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: async () => {
      const { data } = await api.get("/repos");
      return data;
    },
  });
}

export function useAddRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoName: string) => {
      const { data } = await api.post("/repos", { repoName });
      return data;
    },
    onSuccess: () => {
      toast.success("Repository added");
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Failed to add repository");
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete("/repos", { data: { id } });
      return data;
    },
    onSuccess: () => {
      toast.success("Repository deleted");
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
    onError: () => {
      toast.error("Failed to delete repository");
    },
  });
}

export interface UpdateRepoSettingsParams {
  id: string;
  allowedEvents: string[];
  allowedAuthors: string[];
  groupIds: string[] | null;
  messageTemplate: string | null;
  detailedDateLanguage: string | null;
  isActive: boolean | null;
}

export function useUpdateRepoSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateRepoSettingsParams) => {
      const { data } = await api.patch("/repos", params);
      return data;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });
}
