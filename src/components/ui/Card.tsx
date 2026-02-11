"use client";

import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-3xl shadow-lg", {
  variants: {
    variant: {
      default: "bg-white p-6",
      stat: "bg-white p-6",
      subject: "bg-white p-6",
      gradient: "p-6 text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  gradient?: string;
}

export function Card({
  className,
  variant,
  gradient,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(cardVariants({ variant, className }))}
      style={
        variant === "gradient" && gradient
          ? { background: gradient }
          : undefined
      }
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}

export { cardVariants };
