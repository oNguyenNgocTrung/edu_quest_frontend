"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Flame, Coins, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold rounded-full",
  {
    variants: {
      variant: {
        level: "bg-purple-100 text-purple-700",
        streak: "bg-orange-100 text-orange-700",
        coins: "bg-yellow-100 text-yellow-700",
        active: "bg-green-100 text-green-700",
        needsPractice: "bg-red-100 text-red-700",
        locked: "bg-gray-100 text-gray-700",
      },
      size: {
        sm: "text-xs px-2.5 py-1",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
      },
    },
    defaultVariants: {
      variant: "level",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  value?: string | number;
}

const variantIcons: Partial<Record<string, React.ElementType>> = {
  streak: Flame,
  coins: Coins,
  locked: Lock,
};

const variantLabels: Record<string, (value?: string | number) => string> = {
  level: (v) => `Level ${v ?? ""}`,
  streak: (v) => `${v ?? ""} Day Streak`,
  coins: (v) => `${v ?? ""} Coins`,
  active: () => "Active",
  needsPractice: () => "Needs Practice",
  locked: () => "Locked",
};

export function Badge({
  className,
  variant = "level",
  size,
  value,
  children,
  ...props
}: BadgeProps) {
  const Icon = variantIcons[variant ?? "level"];
  const label = children ?? variantLabels[variant ?? "level"]?.(value);

  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </span>
  );
}

export { badgeVariants };
