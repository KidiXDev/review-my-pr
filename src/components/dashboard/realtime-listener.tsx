"use client";

import { useRealtime } from "@/hooks/use-realtime";

export function RealtimeListener() {
  useRealtime();
  return null;
}
