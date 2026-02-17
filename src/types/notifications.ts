export type NotificationType =
  | `github:${string}`
  | "group:added"
  | "repo:added"
  | "whatsapp:connected"
  | "whatsapp:disconnected"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "system"
  | (string & {});

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
  metadata?: string | null;
}
