"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRealtime() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only connect if not already connected
    if (eventSourceRef.current) return;

    console.log("Initializing Realtime connection...");
    const eventSource = new EventSource("/api/sse");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("Realtime connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Realtime update received:", data);

        // Handle different event types
        switch (data.type) {
          case "connected":
            console.log("SSE Connected");
            break;

          case "whatsapp:status":
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            if (data.data.isConnected) {
              toast.success("WhatsApp Connected!");
            } else if (data.data.isReady === false) {
              toast.info("WhatsApp Disconnected");
            }
            break;

          case "whatsapp:qr":
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            break;

          case "repo:added":
          case "repo:deleted":
            queryClient.invalidateQueries({ queryKey: ["repos"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            break;

          case "group:added":
          case "group:updated":
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            break;

          case "notification":
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }); // For total events count

            // Show toast for notification
            if (data.data?.data?.title) {
              toast.info(data.data.data.title, {
                description: data.data.data.message,
              });
            }
            break;

          default:
            console.log("Unknown event type:", data.type);
        }
      } catch (error) {
        console.error("Error processing realtime message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Realtime connection error:", error);
      eventSource.close();
      eventSourceRef.current = null;

      // Auto-reconnect after a delay (browser usually handles this for SSE, but good to be safe)
      setTimeout(() => {
        if (!eventSourceRef.current) {
          // Re-run effect logic will handle reconnection
        }
      }, 5000);
    };

    return () => {
      if (eventSourceRef.current) {
        console.log("Closing Realtime connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [queryClient]);
}
