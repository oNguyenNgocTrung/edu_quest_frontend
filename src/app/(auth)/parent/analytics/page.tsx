"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/api-client";
import type {
  PerformanceDataPoint,
  SubjectBreakdownPoint,
  AccuracyDataPoint,
  MasteryDataPoint,
  DashboardSummary,
} from "@/types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  Flame,
  Download,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { StatCard } from "@/components/parent/StatCard";

export default function AnalyticsPage() {
  const router = useRouter();
  const { currentChildProfile } = useAuthStore();

  const { data: summary } = useQuery({
    queryKey: ["dashboard_summary", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/dashboard_summary");
      return data as DashboardSummary;
    },
    enabled: !!currentChildProfile,
  });

  const { data: performance } = useQuery({
    queryKey: ["analytics", "performance", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/performance?days=7");
      return data as PerformanceDataPoint[];
    },
  });

  const { data: subjectBreakdown } = useQuery({
    queryKey: ["analytics", "subject_breakdown", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/subject_breakdown");
      return data as SubjectBreakdownPoint[];
    },
  });

  const { data: accuracy } = useQuery({
    queryKey: ["analytics", "accuracy", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/accuracy_by_topic");
      return data as AccuracyDataPoint[];
    },
  });

  const { data: mastery } = useQuery({
    queryKey: ["analytics", "mastery", currentChildProfile?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/mastery_progress");
      return data as MasteryDataPoint[];
    },
  });

  const totalCards =
    mastery?.reduce((sum, item) => sum + item.count, 0) || 0;

  const weakTopics =
    accuracy
      ?.filter((t) => t.accuracy < 80)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3) || [];

  const stats = [
    {
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      value: `${summary?.accuracy ?? 0}%`,
      label: "Average Score",
      change:
        summary && summary.accuracy_change !== 0
          ? `${summary.accuracy_change > 0 ? "+" : ""}${summary.accuracy_change}%`
          : undefined,
      trend:
        summary && summary.accuracy_change > 0
          ? ("up" as const)
          : summary && summary.accuracy_change < 0
            ? ("down" as const)
            : undefined,
    },
    {
      icon: Clock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      value: `${summary?.daily_avg_minutes ?? 0} min`,
      label: "Daily Average",
    },
    {
      icon: Award,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      value: `${summary?.mastered_count ?? 0}`,
      label: "Cards Mastered",
    },
    {
      icon: Flame,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      value: `${summary?.streak_days ?? 0} days`,
      label: "Current Streak",
      change:
        summary && summary.streak_days === summary.streak_longest && summary.streak_days > 0
          ? "Record!"
          : undefined,
      trend:
        summary && summary.streak_days === summary.streak_longest && summary.streak_days > 0
          ? ("up" as const)
          : undefined,
    },
  ];

  const tooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "12px",
  };

  const weaknessLabel = (accuracy: number) => {
    if (accuracy < 60) return "Needs more practice";
    if (accuracy < 70) return "Below target";
    return "Room for growth";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/parent/dashboard")}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Progress Analytics
                </h1>
                <p className="text-sm text-gray-500">
                  Track {currentChildProfile?.name || "your child"}&apos;s
                  learning journey
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
                <Calendar className="w-4 h-4" />
                Last 7 Days
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Performance Trend
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Subject Breakdown - Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Time by Subject
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {subjectBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Accuracy by Topic - Horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Accuracy by Topic
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={accuracy || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  type="category"
                  dataKey="topic"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  width={100}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="accuracy"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mastery Progress - Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Mastery Progress
            </h2>
            {mastery && (
              <div className="space-y-4">
                {mastery.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.category}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {item.count} cards
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${totalCards > 0 ? (item.count / totalCards) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Cards</span>
                <span className="text-xl font-bold text-gray-800">
                  {totalCards}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Areas for Improvement */}
        {weakTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Areas for Improvement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weakTopics.map((topic) => (
                    <div
                      key={topic.topic}
                      className="bg-white rounded-lg p-4"
                    >
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {topic.topic}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {topic.accuracy}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {weaknessLabel(topic.accuracy)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
