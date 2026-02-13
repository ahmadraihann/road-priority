// src/hooks/use-toast.ts
import { toast as sonnerToast } from "sonner";
import * as React from "react";

/**
 * Props toast yang kita expose
 * mirip dengan toast shadcn lama
 */
export type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
};

/**
 * Wrapper toast -> sonner
 */
function toast(props: ToastProps) {
  const id = sonnerToast(props.title ?? "", {
    description: props.description,
    duration: props.duration,
    action: props.action
      ? {
          label: props.action.label,
          onClick: props.action.onClick,
        }
      : undefined,
  });

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (next: ToastProps) =>
      sonnerToast(next.title ?? "", {
        id,
        description: next.description,
        duration: next.duration,
        action: next.action
          ? {
              label: next.action.label,
              onClick: next.action.onClick,
            }
          : undefined,
      }),
  };
}

/**
 * useToast → compatibility layer
 * supaya pemanggilan lama tidak rusak
 */
function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },
  };
}

export { toast, useToast };
