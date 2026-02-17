"use client";

import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { type Notification } from "@/types/notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getNotifications();
        setNotifications(history);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Subscribe to SSE
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle connection message
        if (data.type === "connected") return;

        // Ensure dates are parsed
        const newNotification = {
          ...data,
          createdAt: new Date(data.createdAt),
          link: data.link || null,
          metadata: data.metadata || null,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        toast(data.title, {
          description: data.message,
          action: data.link
            ? {
                label: "View",
                onClick: () => router.push(data.link),
              }
            : undefined,
        });
      } catch {
        // ignore keep-alive or parse errors
      }
    };

    eventSource.onerror = () => {
      // Reconnection is automatic by browser, but we can handle error states here
      // console.error("SSE Error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    await markNotificationAsRead(id);
    router.refresh();
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
    router.refresh(); // Refresh server components if needed
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
