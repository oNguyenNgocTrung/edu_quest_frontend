"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  index?: number;
}

export function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  change,
  trend,
  index = 0,
}: StatCardProps) {
  const trendColors = {
    up: "bg-green-100 text-green-700",
    down: "bg-red-100 text-red-700",
    neutral: "bg-blue-100 text-blue-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change && trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${trendColors[trend]}`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}
