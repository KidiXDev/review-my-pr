"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[600px] p-0 overflow-hidden dark:bg-zinc-950/90 backdrop-blur-xl border-zinc-200/20 shadow-2xl",
          className,
        )}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl" asChild>
            <div>{title}</div>
          </DialogTitle>
          {description && (
            <DialogDescription className="text-zinc-500 dark:text-zinc-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className={cn("p-6 space-y-8", contentClassName)}>
            {children}
          </div>
        </ScrollArea>

        {footer && (
          <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200/50 dark:border-zinc-800/50">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
