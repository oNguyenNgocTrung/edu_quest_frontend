"use client";

import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressBarVariants = cva("bg-gray-200 rounded-full overflow-hidden", {
  variants: {
    size: {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type ProgressVariant = "xp" | "daily" | "mastery";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  variant?: ProgressVariant;
  animated?: boolean;
}

function getBarColor(variant: ProgressVariant, value: number) {
  switch (variant) {
    case "xp":
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    case "daily":
      return "bg-gradient-to-r from-orange-400 to-pink-500";
    case "mastery":
      if (value >= 80) return "bg-green-500";
      if (value >= 50) return "bg-yellow-500";
      return "bg-orange-500";
  }
}

export function ProgressBar({
  className,
  value,
  variant = "xp",
  size,
  animated = true,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const barColor = getBarColor(variant, clampedValue);

  return (
    <div
      className={cn(progressBarVariants({ size, className }))}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {animated ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      ) : (
        <div
          className={cn("h-full rounded-full", barColor)}
          style={{ width: `${clampedValue}%` }}
        />
      )}
    </div>
  );
}

export { progressBarVariants };
