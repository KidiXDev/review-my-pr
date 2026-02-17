"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { type Notification } from "@/types/notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  ExternalLink,
  Github,
  MessageSquare,
  Package,
  AlertCircle,
  Info,
  CheckCircle2,
  Inbox,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  "group:added": <MessageSquare className="h-4 w-4 text-green-500" />,
  "repo:added": <Github className="h-4 w-4 text-blue-500" />,
  "whatsapp:connected": <MessageSquare className="h-4 w-4 text-green-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  warning: <AlertCircle className="h-4 w-4 text-warning" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  package: <Package className="h-4 w-4" />,
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}) {
  const typePrefix = notification.type.split(":")[0];
  const Icon = ICON_MAP[notification.type] || ICON_MAP[typePrefix] || (
    <Bell className="h-4 w-4" />
  );

  return (
    <div
      className={cn(
        "flex gap-3 border-b p-4 last:border-0 hover:bg-muted/50 transition-colors relative group",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground",
          !notification.isRead && "border-primary/20 text-primary",
        )}
      >
        {Icon}
      </div>
      <div className="flex flex-1 flex-col gap-1 pr-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium leading-none",
              !notification.isRead && "text-foreground font-semibold",
            )}
          >
            {notification.title}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(notification.createdAt, {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {notification.link && (
            <Link
              href={notification.link}
              onClick={() => {
                if (!notification.isRead) {
                  onMarkAsRead(notification.id);
                }
                onClose();
              }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-auto gap-1 px-2 text-[10px]"
              >
                View
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-auto px-2 text-[10px] text-muted-foreground"
              onClick={() => onMarkAsRead(notification.id)}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
      {!notification.isRead && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 border-b p-4 last:border-0">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="mt-2">
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  );
}

export function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead),
    [notifications],
  );

  const groupNotifications = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    items.forEach((item) => {
      if (isToday(item.createdAt)) {
        groups.Today.push(item);
      } else if (isYesterday(item.createdAt)) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const allGroups = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );
  const unreadGroups = useMemo(
    () => groupNotifications(unreadNotifications),
    [unreadNotifications],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="size-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-2 top-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary shadow-sm"
              />
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="flex-1">
            <div className="bg-muted/30 px-4 py-2 border-b">
              <TabsList className="h-8 w-full bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="relative h-8 flex-1 rounded-full border-b-2 border-transparent bg-transparent px-0 pb-2 pt-2 text-xs font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="relative h-8 flex-1 rounded-full border-b-2 border-transparent bg-transparent px-0 pb-2 pt-2 text-xs font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[400px]">
              <AnimatePresence>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <NotificationSkeleton key={i} />
                  ))
                ) : (
                  <>
                    <TabsContent value="all" className="m-0 border-0">
                      {notifications.length === 0 ? (
                        <div className="p-8">
                          <Empty>
                            <EmptyMedia variant="icon">
                              <Inbox className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyContent>
                              <EmptyTitle>All caught up!</EmptyTitle>
                              <EmptyDescription>
                                You don&apos;t have any notifications at the
                                moment.
                              </EmptyDescription>
                            </EmptyContent>
                          </Empty>
                        </div>
                      ) : (
                        allGroups.map(([title, items]) => (
                          <div key={title}>
                            <div className="bg-muted/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
                              {title}
                            </div>
                            <div className="flex flex-col">
                              {items.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  onClose={() => setOpen(false)}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                    <TabsContent value="unread" className="m-0 border-0">
                      {unreadNotifications.length === 0 ? (
                        <div className="p-8">
                          <Empty>
                            <EmptyMedia variant="icon">
                              <Check className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyContent>
                              <EmptyTitle>No unread</EmptyTitle>
                              <EmptyDescription>
                                You&apos;ve read all your notifications. Great
                                job!
                              </EmptyDescription>
                            </EmptyContent>
                          </Empty>
                        </div>
                      ) : (
                        unreadGroups.map(([title, items]) => (
                          <div key={title}>
                            <div className="bg-muted/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
                              {title}
                            </div>
                            <div className="flex flex-col">
                              {items.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  onClose={() => setOpen(false)}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  </>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
