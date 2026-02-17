import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ActivityDataPoint {
  date: string;
  fullDate: string;
  events: number;
  messages: number;
}

export function useActivity() {
  return useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const { data } = await axios.get<ActivityDataPoint[]>(
        "/api/dashboard/activity",
      );
      return data;
    },
    refetchInterval: 60000,
  });
}
