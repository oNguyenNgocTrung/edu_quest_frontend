"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { PerformanceDataPoint } from "@/types";

interface ActivityHeatmapProps {
  performanceData?: PerformanceDataPoint[];
  streakDays?: number;
}

export function ActivityHeatmap({
  performanceData,
  streakDays = 0,
}: ActivityHeatmapProps) {
  // Build 30-day heatmap data
  const heatmapData = Array.from({ length: 30 }, (_, i) => {
    const dayIndex = 29 - i; // Most recent day first in data

    // Last 7 days use actual performance data
    if (dayIndex < 7 && performanceData && performanceData[dayIndex]) {
      return {
        day: i + 1,
        active: performanceData[dayIndex].score > 0,
        intensity: performanceData[dayIndex].score,
      };
    }

    // Older days: use streak info to estimate
    if (dayIndex < streakDays) {
      return { day: i + 1, active: true, intensity: 70 };
    }

    return { day: i + 1, active: false, intensity: 0 };
  });

  const getColor = (active: boolean, intensity: number) => {
    if (!active) return "bg-gray-100 hover:bg-gray-200";
    if (intensity >= 90) return "bg-green-600 hover:bg-green-700";
    if (intensity >= 70) return "bg-green-500 hover:bg-green-600";
    if (intensity >= 50) return "bg-green-400 hover:bg-green-500";
    return "bg-green-300 hover:bg-green-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Activity Heatmap</h2>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-10 gap-2">
        {heatmapData.map((day) => (
          <div
            key={day.day}
            className={`aspect-square rounded-md transition-all ${getColor(day.active, day.intensity)}`}
            title={`Day ${day.day}${day.active ? ` - ${day.intensity}%` : ""}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">Last 30 days</p>
    </motion.div>
  );
}
