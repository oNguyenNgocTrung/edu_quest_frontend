"use client";

import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "rounded-lg p-4 flex items-start gap-3 border-l-4",
  {
    variants: {
      variant: {
        success: "bg-green-50 border-green-500",
        info: "bg-blue-50 border-blue-500",
        warning: "bg-orange-50 border-orange-500",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconColorMap = {
  success: "text-green-600",
  info: "text-blue-600",
  warning: "text-orange-600",
};

const titleColorMap = {
  success: "text-green-800",
  info: "text-blue-800",
  warning: "text-orange-800",
};

const messageColorMap = {
  success: "text-green-700",
  info: "text-blue-700",
  warning: "text-orange-700",
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  message,
  dismissible = false,
  onDismiss,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const v = variant ?? "info";
  const Icon = v === "success" ? Check : AlertCircle;

  return (
    <div className={cn(alertVariants({ variant, className }), "relative")} {...props}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColorMap[v])} />
      <div className="flex-1">
        <p className={cn("font-semibold", titleColorMap[v])}>{title}</p>
        <p className={cn("text-sm", messageColorMap[v])}>{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export { alertVariants };
