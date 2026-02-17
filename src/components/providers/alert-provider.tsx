"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface AlertOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

interface AlertContextType {
  confirm: (options: AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    AlertOptions & { resolve: (value: boolean) => void }
  >({
    title: "",
    description: "",
    resolve: () => {},
  });

  const confirm = useCallback((opts: AlertOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ ...opts, resolve });
      setOpen(true);
    });
  }, []);

  const handleCancel = () => {
    setOpen(false);
    options.resolve(false);
  };

  const handleConfirm = () => {
    setOpen(false);
    options.resolve(true);
  };

  return (
    <AlertContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              variant={options.variant || "default"}
            >
              {options.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
